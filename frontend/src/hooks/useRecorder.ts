import { useEffect, useMemo, useRef, useState } from 'react'

type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped'

export const useRecorder = () => {
  const [state, setState] = useState<RecorderState>('idle')
  const [durationSec, setDurationSec] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob>()
  const [waveform, setWaveform] = useState<number[]>(new Array(24).fill(0))
  const [error, setError] = useState<string>()

  const mediaRecorderRef = useRef<MediaRecorder>()
  const streamRef = useRef<MediaStream>()
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const rafRef = useRef<number>()

  const stopVisualizer = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = undefined
  }

  const teardown = () => {
    stopVisualizer()
    if (timerRef.current) window.clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioContextRef.current?.close()
    timerRef.current = undefined
  }

  const tickWaveform = () => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    const step = Math.max(1, Math.floor(data.length / 24))
    const bars = Array.from({ length: 24 }, (_, i) => {
      const v = data[i * step] ?? 128
      return Math.abs((v - 128) / 128)
    })
    setWaveform(bars)
    rafRef.current = requestAnimationFrame(tickWaveform)
  }

  const start = async () => {
    try {
      setError(undefined)
      setAudioBlob(undefined)
      setDurationSec(0)
      chunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (evt) => chunksRef.current.push(evt.data)
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
        setState('stopped')
      }
      recorder.start()

      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = ctx
      analyserRef.current = analyser
      tickWaveform()

      timerRef.current = window.setInterval(() => setDurationSec((v) => v + 1), 1000)
      setState('recording')
      return true
    } catch {
      setError('Microphone access is unavailable in this browser or denied by permissions.')
      return false
    }
  }

  const pause = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      if (timerRef.current) clearInterval(timerRef.current)
      setState('paused')
    }
  }

  const resume = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      timerRef.current = window.setInterval(() => setDurationSec((v) => v + 1), 1000)
      setState('recording')
    }
  }

  const stop = () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    teardown()
  }

  const reset = () => {
    teardown()
    setState('idle')
    setDurationSec(0)
    setAudioBlob(undefined)
    setWaveform(new Array(24).fill(0))
  }

  useEffect(() => () => teardown(), [])

  return useMemo(
    () => ({ state, durationSec, audioBlob, waveform, error, start, pause, resume, stop, reset }),
    [state, durationSec, audioBlob, waveform, error],
  )
}
