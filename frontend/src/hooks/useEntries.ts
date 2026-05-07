import { useCallback, useEffect, useState } from 'react'
import type { CreateEntryInput, JournalEntry } from '../types/journal'
import { dbService } from '../services/db'

export const useEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setEntries(await dbService.listEntries())
    setIsLoading(false)
  }, [])

  const createEntry = useCallback(async (input: CreateEntryInput) => {
    const created = await dbService.createEntry(input)
    await refresh()
    return created
  }, [refresh])

  const updateEntry = useCallback(async (id: string, patch: Partial<JournalEntry>) => {
    const updated = await dbService.updateEntry(id, patch)
    await refresh()
    return updated
  }, [refresh])

  const deleteEntry = useCallback(async (id: string) => {
    await dbService.deleteEntry(id)
    await refresh()
  }, [refresh])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { entries, isLoading, refresh, createEntry, updateEntry, deleteEntry }
}
