import { useMemo, useState } from 'react'
import { JournalCard } from '../components/JournalCard'
import { SearchBar } from '../components/SearchBar'
import type { JournalEntry } from '../types/journal'
import { filterEntries } from '../utils/search'

interface JournalBrowserPageProps {
  entries: JournalEntry[]
}

export const JournalBrowserPage = ({ entries }: JournalBrowserPageProps) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const categories = useMemo(
    () => ['All', ...new Set(entries.map((e) => e.customCategory || e.category))],
    [entries],
  )

  const filtered = useMemo(
    () => filterEntries(entries, { query, category, sort, favoritesOnly }),
    [entries, query, category, sort, favoritesOnly],
  )

  return (
    <div className="stack-lg">
      <h1>Journal Browser</h1>
      <section className="card stack-md">
        <SearchBar value={query} onChange={setQuery} />
        <div className="row-wrap">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Favorites only
          </label>
        </div>
      </section>
      <section className="stack-md">
        {filtered.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
        {filtered.length === 0 && <p className="muted">No matching entries.</p>}
      </section>
    </div>
  )
}
