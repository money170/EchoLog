import { useState } from 'react'
import { settingsService } from '../services/settings'

interface SettingsPageProps {
  isDarkMode: boolean
  onToggleDarkMode: (value: boolean) => void
}

export const SettingsPage = ({ isDarkMode, onToggleDarkMode }: SettingsPageProps) => {
  const [passcode, setPasscode] = useState('')
  const [status, setStatus] = useState('')
  const settings = settingsService.get()

  return (
    <div className="stack-lg">
      <h1>Privacy & Settings</h1>
      <section className="card stack-md">
        <h3>Privacy</h3>
        <p>Your data never leaves this device. EchoLog is local-only by default.</p>
      </section>

      <section className="card stack-md">
        <h3>Theme</h3>
        <label className="check">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={(e) => onToggleDarkMode(e.target.checked)}
          />
          Enable dark mode
        </label>
      </section>

      <section className="card stack-md">
        <h3>Passcode lock (optional)</h3>
        <p className="muted">Soft local lock for privacy UX. Not a full encryption system.</p>
        <input
          type="password"
          className="input"
          value={passcode}
          placeholder="Set a local passcode"
          onChange={(e) => setPasscode(e.target.value)}
        />
        <div className="row-wrap">
          <button
            type="button"
            className="button"
            onClick={async () => {
              if (passcode.trim().length < 4) {
                setStatus('Passcode must be at least 4 characters.')
                return
              }
              await settingsService.setPasscode(passcode)
              setPasscode('')
              setStatus('Passcode enabled.')
            }}
          >
            Save passcode
          </button>
          <button
            type="button"
            className="button-muted"
            disabled={!settings.passcodeEnabled}
            onClick={() => {
              settingsService.clearPasscode()
              setStatus('Passcode disabled.')
            }}
          >
            Remove passcode
          </button>
        </div>
        {status && <p className="muted">{status}</p>}
      </section>
    </div>
  )
}
