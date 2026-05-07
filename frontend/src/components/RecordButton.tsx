interface RecordButtonProps {
  isRecording: boolean
  onClick: () => void
}

export const RecordButton = ({ isRecording, onClick }: RecordButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`record-btn ${isRecording ? 'recording' : ''}`}
    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
  >
    <span />
  </button>
)
