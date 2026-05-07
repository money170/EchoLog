import { Link } from 'react-router-dom'
import { JournalCard } from '../components/JournalCard'
import type { JournalEntry } from '../types/journal'

interface DashboardPageProps {
  entries: JournalEntry[]
}

const dayStamp = (date: Date) => date.toISOString().slice(0, 10)

const computeStreak = (entries: JournalEntry[]) => {
  const days = new Set(entries.map((e) => dayStamp(new Date(e.createdAt))))
  let streak = 0
  const d = new Date()
  while (days.has(dayStamp(d))) {
    streak += 1
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export const DashboardPage = ({ entries }: DashboardPageProps) => {
  const totalDuration = entries.reduce((sum, e) => sum + e.durationSec, 0)
  const streak = computeStreak(entries)
  const summary = entries.reduce<Record<string, number>>((acc, entry) => {
    const key = entry.customCategory || entry.category
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="stack-lg">
      <div className="card gradient">
        <h1>EchoLog</h1>
        <p>Private voice journaling for thoughts, meetings, ideas, and reflection.</p>
        <p className="muted">Your data never leaves this device.</p>
        <Link to="/record" className="button link-btn">
          Quick Record
        </Link>
      </div>

      <section className="grid-3">
        <article className="card">
          <h3>Total recordings</h3>
          <p>{entries.length}</p>
        </article>
        <article className="card">
          <h3>Total time</h3>
          <p>{Math.round(totalDuration / 60)} min</p>
        </article>
        <article className="card">
          <h3>Current streak</h3>
          <p>{streak} days</p>
        </article>
      </section>

      <section className="card">
        <h3>Category summary</h3>
        <div className="tags-row">
          {Object.keys(summary).length === 0 && <span className="muted">No entries yet.</span>}
          {Object.entries(summary).map(([key, value]) => (
            <span key={key} className="pill">{`${key}: ${value}`}</span>
          ))}
        </div>
      </section>

      <section className="stack-md">
        <h2>Recent entries</h2>
        {entries.slice(0, 4).map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
      </section>
    </div>
  )
}
