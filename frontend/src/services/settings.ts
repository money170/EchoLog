const SETTINGS_KEY = 'speechjournal-settings'

export interface AppSettings {
  hasCompletedPrivacyOnboarding: boolean
  darkMode: boolean
  passcodeHash?: string
  passcodeEnabled: boolean
}

const defaults: AppSettings = {
  hasCompletedPrivacyOnboarding: false,
  darkMode: true,
  passcodeEnabled: false,
}

const hashPasscode = async (input: string) => {
  const encoded = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const settingsService = {
  get() {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults
    try {
      return { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) }
    } catch {
      return defaults
    }
  },
  set(patch: Partial<AppSettings>) {
    const current = this.get()
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }))
  },
  async setPasscode(passcode: string) {
    const passcodeHash = await hashPasscode(passcode)
    this.set({ passcodeHash, passcodeEnabled: true })
  },
  async verifyPasscode(passcode: string) {
    const current = this.get()
    if (!current.passcodeHash) return false
    return current.passcodeHash === (await hashPasscode(passcode))
  },
  clearPasscode() {
    this.set({ passcodeHash: undefined, passcodeEnabled: false })
  },
}
