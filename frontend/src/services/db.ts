import { openDB } from 'idb'
import type { CreateEntryInput, JournalEntry } from '../types/journal'

const DB_NAME = 'echolog-db'
const DB_VERSION = 1
const ENTRY_STORE = 'entries'
const AUDIO_STORE = 'audio'

const getDb = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ENTRY_STORE)) {
        db.createObjectStore(ENTRY_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE)
      }
    },
  })

const uid = () => crypto.randomUUID()

export const dbService = {
  async listEntries() {
    const db = await getDb()
    const entries = (await db.getAll(ENTRY_STORE)) as JournalEntry[]
    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async getEntry(id: string) {
    const db = await getDb()
    return (await db.get(ENTRY_STORE, id)) as JournalEntry | undefined
  },

  async getAudioBlob(audioBlobKey?: string) {
    if (!audioBlobKey) return undefined
    const db = await getDb()
    return (await db.get(AUDIO_STORE, audioBlobKey)) as Blob | undefined
  },

  async createEntry(input: CreateEntryInput) {
    const db = await getDb()
    const now = new Date().toISOString()
    const id = uid()
    let audioBlobKey: string | undefined
    let audioMimeType = ''

    if (input.audioBlob) {
      audioBlobKey = `${id}-audio`
      audioMimeType = input.audioBlob.type || 'audio/webm'
      await db.put(AUDIO_STORE, input.audioBlob, audioBlobKey)
    }

    const entry: JournalEntry = {
      id,
      title: input.title,
      createdAt: now,
      updatedAt: now,
      durationSec: input.durationSec,
      audioMimeType,
      audioBlobKey,
      transcript: input.transcript,
      category: input.category,
      customCategory: input.customCategory,
      tags: input.tags ?? [],
      isFavorite: false,
    }

    await db.put(ENTRY_STORE, entry)
    return entry
  },

  async updateEntry(id: string, patch: Partial<JournalEntry>) {
    const db = await getDb()
    const current = (await db.get(ENTRY_STORE, id)) as JournalEntry | undefined
    if (!current) return undefined
    const next: JournalEntry = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    await db.put(ENTRY_STORE, next)
    return next
  },

  async deleteEntry(id: string) {
    const db = await getDb()
    const current = (await db.get(ENTRY_STORE, id)) as JournalEntry | undefined
    if (!current) return
    if (current.audioBlobKey) {
      await db.delete(AUDIO_STORE, current.audioBlobKey)
    }
    await db.delete(ENTRY_STORE, id)
  },
}
