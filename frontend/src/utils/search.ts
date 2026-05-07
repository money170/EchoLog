import type { JournalEntry } from '../types/journal'

export interface EntryFilters {
  query: string
  category: string
  favoritesOnly: boolean
  sort: 'newest' | 'oldest'
}

const includes = (value: string, query: string) =>
  value.toLocaleLowerCase().includes(query.toLocaleLowerCase())

export const filterEntries = (entries: JournalEntry[], filters: EntryFilters) => {
  const filtered = entries.filter((entry) => {
    const label = entry.customCategory?.trim() || entry.category
    const queryMatch =
      filters.query.trim().length === 0 ||
      includes(entry.title, filters.query) ||
      includes(entry.transcript, filters.query) ||
      entry.tags.some((tag) => includes(tag, filters.query))
    const categoryMatch = filters.category === 'All' || label === filters.category
    const favoriteMatch = !filters.favoritesOnly || entry.isFavorite
    return queryMatch && categoryMatch && favoriteMatch
  })

  return filtered.sort((a, b) =>
    filters.sort === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}
