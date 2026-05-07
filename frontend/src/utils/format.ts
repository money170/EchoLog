export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${mins}:${sec.toString().padStart(2, '0')}`
}

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
