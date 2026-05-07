import type { JournalEntry } from '../types/journal'
import { dbService } from './db'

const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export const exportService = {
  exportTranscript(entry: JournalEntry) {
    const blob = new Blob([entry.transcript || ''], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `${entry.title || 'entry'}.txt`)
  },
  exportJson(entry: JournalEntry) {
    const blob = new Blob([JSON.stringify(entry, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    downloadBlob(blob, `${entry.title || 'entry'}.json`)
  },
  async exportAudio(entry: JournalEntry) {
    const audio = await dbService.getAudioBlob(entry.audioBlobKey)
    if (!audio) return
    const ext = entry.audioMimeType.includes('mpeg') ? 'mp3' : 'webm'
    downloadBlob(audio, `${entry.title || 'entry'}.${ext}`)
  },
}
