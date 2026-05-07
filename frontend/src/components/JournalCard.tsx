import { Link } from 'react-router-dom'
import type { JournalEntry } from '../types/journal'
import { formatDateTime, formatDuration } from '../utils/format'

interface JournalCardProps {
  entry: JournalEntry
}

export const JournalCard = ({ entry }: JournalCardProps) => (
  <Link to={`/entry/${entry.id}`} className="card link-card">
    <div className="row-between">
      <h3>{entry.title}</h3>
      {entry.isFavorite && <span>★</span>}
    </div>
    <p className="muted">{formatDateTime(entry.createdAt)}</p>
    <p>{entry.transcript.slice(0, 110) || 'No transcript yet.'}</p>
    <div className="row-between">
      <span className="pill">{entry.customCategory || entry.category}</span>
      <span className="muted">{formatDuration(entry.durationSec)}</span>
    </div>
  </Link>
)
