import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategorySelector } from '../components/CategorySelector'
import { RecordButton } from '../components/RecordButton'
import { WaveformVisualizer } from '../components/WaveformVisualizer'
import { useRecorder } from '../hooks/useRecorder'
import { useTranscription } from '../hooks/useTranscription'
import type { CreateEntryInput, JournalCategory } from '../types/journal'
import { formatDuration } from '../utils/format'

interface RecordPageProps {
  createEntry: (input: CreateEntryInput) => Promise<{ id: string }>
}

export const RecordPage = ({ createEntry }: RecordPageProps) => {
  const navigate = useNavigate()
  const recorder = useRecorder()
  const transcription = useTranscription()
  const [category, setCategory] = useState<JournalCategory>('Daily Journal')
  const [customCategory, setCustomCategory] = useState('')
  const [title, setTitle] = useState('')

  const handleRecordButton = async () => {
    if (recorder.state === 'idle' || recorder.state === 'stopped') {
      const started = await recorder.start()
      if (started) transcription.start()
      return
    }
    recorder.stop()
  }

  const handleSave = async () => {
    const transcript = await transcription.stop()
    const created = await createEntry({
      title: title.trim() || `Entry ${new Date().toLocaleString()}`,
      durationSec: recorder.durationSec,
      audioBlob: recorder.audioBlob,
      transcript,
      category,
      customCategory: category === 'Custom' ? customCategory.trim() : undefined,
      tags: [],
    })
    recorder.reset()
    navigate(`/entry/${created.id}`)
  }

  return (
    <div className="stack-lg">
      <section className="card center stack-md">
        <h1>Record</h1>
        <p className="timer">{formatDuration(recorder.durationSec)}</p>
        <WaveformVisualizer bars={recorder.waveform} />
        <RecordButton isRecording={recorder.state === 'recording'} onClick={handleRecordButton} />
        <div className="row">
          <button
            type="button"
            className="button-muted"
            onClick={recorder.pause}
            disabled={recorder.state !== 'recording'}
          >
            Pause
          </button>
          <button
            type="button"
            className="button-muted"
            onClick={recorder.resume}
            disabled={recorder.state !== 'paused'}
          >
            Resume
          </button>
          <button
            type="button"
            className="button"
            onClick={recorder.stop}
            disabled={recorder.state !== 'recording' && recorder.state !== 'paused'}
          >
            Stop
          </button>
        </div>
        {(recorder.error || transcription.error) && (
          <p className="error">{recorder.error || transcription.error}</p>
        )}
      </section>

      <section className="card stack-md">
        <input
          className="input"
          placeholder="Entry title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CategorySelector
          category={category}
          customCategory={customCategory}
          onCategoryChange={setCategory}
          onCustomCategoryChange={setCustomCategory}
        />
        <label className="field-label">Live transcript</label>
        <textarea
          className="input"
          value={transcription.liveText}
          readOnly
          rows={5}
          placeholder={
            transcription.supported
              ? 'Listening for speech...'
              : 'Speech recognition not supported. You can save audio without transcript.'
          }
        />
        <button type="button" className="button" onClick={handleSave} disabled={!recorder.audioBlob}>
          Save Entry
        </button>
      </section>
    </div>
  )
}
