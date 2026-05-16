interface PrivacyOnboardingModalProps {
  open: boolean
  onAccept: () => void
}

export const PrivacyOnboardingModal = ({ open, onAccept }: PrivacyOnboardingModalProps) => {
  if (!open) return null
  return (
    <div className="overlay">
      <div className="modal card">
        <h2>Welcome to SpeechLog</h2>
        <p>
          Your recordings, transcripts, and notes stay on this device only. SpeechLog does not use
          cloud sync, accounts, or server storage.
        </p>
        <p className="muted">Your data never leaves this device.</p>
        <button className="button" type="button" onClick={onAccept}>
          Continue
        </button>
      </div>
    </div>
  )
}
