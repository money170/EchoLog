export const coreCategories = [
  'Daily Journal',
  'Work Notes',
  'Meeting Recording',
  'Brain Dump',
  'Ideas',
] as const

export type CoreCategory = (typeof coreCategories)[number]
export type JournalCategory = CoreCategory | 'Custom'

export interface JournalEntry {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  durationSec: number
  audioMimeType: string
  audioBlobKey?: string
  transcript: string
  category: JournalCategory
  customCategory?: string
  tags: string[]
  isFavorite: boolean
}

export interface CreateEntryInput {
  title: string
  durationSec: number
  audioBlob?: Blob
  transcript: string
  category: JournalCategory
  customCategory?: string
  tags?: string[]
}
