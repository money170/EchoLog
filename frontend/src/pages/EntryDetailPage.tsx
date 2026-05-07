import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { exportService } from '../services/export'
import type { JournalEntry } from '../types/journal'
import { formatDateTime, formatDuration } from '../utils/format'

interface EntryDetailPageProps {
  entries: JournalEntry[]
  updateEntry: (id: string, patch: Partial<JournalEntry>) => Promise<JournalEntry | undefined>
  deleteEntry: (id: string) => Promise<void>
}

export const EntryDetailPage = ({ entries, updateEntry, deleteEntry }: EntryDetailPageProps) => {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const entry = useMemo(() => entries.find((e) => e.id === entryId), [entries, entryId])
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [tags, setTags] = useState('')
  const [audioUrl, setAudioUrl] = useState<string>()

  useEffect(() => {
    if (!entry) return
    setTitle(entry.title)
    setTranscript(entry.transcript)
    setTags(entry.tags.join(', '))
  }, [entry])

  useEffect(() => {
    let url = ''
    const run = async () => {
      if (!entry?.audioBlobKey) return
      const { dbService } = await import('../services/db')
      const blob = await dbService.getAudioBlob(entry.audioBlobKey)
      if (!blob) return
      url = URL.createObjectURL(blob)
      setAudioUrl(url)
    }
    void run()
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [entry?.audioBlobKey])

  if (!entry) {
    return (
      <section className="card">
        <h2>Entry not found</h2>
      </section>
    )
  }

  const save = async () => {
    await updateEntry(entry.id, {
      title: title.trim() || entry.title,
      transcript,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="stack-lg">
      <section className="card stack-md">
        <div className="row-between">
          <h1>{entry.title}</h1>
          <button
            type="button"
            className="button-muted"
            onClick={() => void updateEntry(entry.id, { isFavorite: !entry.isFavorite })}
          >
            {entry.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
        </div>
        <p className="muted">{formatDateTime(entry.createdAt)}</p>
        <p className="muted">{formatDuration(entry.durationSec)}</p>
        {audioUrl ? <audio controls src={audioUrl} /> : <p className="muted">No audio found.</p>}
      </section>
      <section className="card stack-md">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          className="input"
          rows={8}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <input
          className="input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma separated"
        />
        <div className="row-wrap">
          <button type="button" className="button" onClick={save}>
            Save edits
          </button>
          <button type="button" className="button-muted" onClick={() => exportService.exportTranscript(entry)}>
            Export TXT
          </button>
          <button type="button" className="button-muted" onClick={() => exportService.exportJson(entry)}>
            Export JSON
          </button>
          <button type="button" className="button-muted" onClick={() => void exportService.exportAudio(entry)}>
            Export Audio
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={async () => {
              await deleteEntry(entry.id)
              navigate('/journal')
            }}
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  )
}
