import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { PrivacyOnboardingModal } from './components/PrivacyOnboardingModal'
import { useEntries } from './hooks/useEntries'
import { DashboardPage } from './pages/DashboardPage'
import { EntryDetailPage } from './pages/EntryDetailPage'
import { JournalBrowserPage } from './pages/JournalBrowserPage'
import { RecordPage } from './pages/RecordPage'
import { SettingsPage } from './pages/SettingsPage'
import { settingsService } from './services/settings'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/record', label: 'Record' },
  { to: '/journal', label: 'Journal' },
  { to: '/settings', label: 'Settings' },
]

function App() {
  const entriesApi = useEntries()
  const [settings, setSettings] = useState(settingsService.get())
  const [unlockCode, setUnlockCode] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [lockError, setLockError] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  const refreshSettings = () => setSettings(settingsService.get())

  const requiresUnlock = useMemo(() => settings.passcodeEnabled, [settings.passcodeEnabled])

  if (requiresUnlock && !isUnlocked) {
    return (
      <main className="page center-page">
        <section className="card stack-md">
          <h2>Unlock SpeechJournal</h2>
          <p className="muted">Local passcode required for this browser profile.</p>
          <input
            className="input"
            type="password"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value)}
          />
          <button
            className="button"
            type="button"
            onClick={async () => {
              if (await settingsService.verifyPasscode(unlockCode)) {
                setIsUnlocked(true)
                setLockError('')
              } else {
                setLockError('Incorrect passcode')
              }
            }}
          >
            Unlock
          </button>
          {lockError && <p className="error">{lockError}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <PrivacyOnboardingModal
        open={!settings.hasCompletedPrivacyOnboarding}
        onAccept={() => {
          settingsService.set({ hasCompletedPrivacyOnboarding: true })
          refreshSettings()
        }}
      />
      <header className="topbar">
        <strong>SpeechJournal</strong>
        <nav>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<DashboardPage entries={entriesApi.entries} />} />
        <Route path="/record" element={<RecordPage createEntry={entriesApi.createEntry} />} />
        <Route path="/journal" element={<JournalBrowserPage entries={entriesApi.entries} />} />
        <Route
          path="/entry/:entryId"
          element={
            <EntryDetailPage
              entries={entriesApi.entries}
              updateEntry={entriesApi.updateEntry}
              deleteEntry={entriesApi.deleteEntry}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              isDarkMode={settings.darkMode}
              onToggleDarkMode={(value) => {
                settingsService.set({ darkMode: value })
                refreshSettings()
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App
