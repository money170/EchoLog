import { useMemo, useRef, useState } from 'react'

export const useTranscription = () => {
  const [liveText, setLiveText] = useState('')
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState<string>()
  const finalRef = useRef('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const stopTimeoutRef = useRef<number | null>(null)

  const getConstructor = () =>
    window.SpeechRecognition ?? window.webkitSpeechRecognition ?? undefined

  const start = () => {
    const Ctor = getConstructor()
    if (!Ctor) {
      setSupported(false)
      return
    }
    finalRef.current = ''
    setLiveText('')
    setError(undefined)
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) finalRef.current += `${text} `
        else interim += text
      }
      setLiveText(`${finalRef.current}${interim}`.trim())
    }
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError('Transcription encountered an issue.')
      }
    }
    recognition.onend = () => {
      recognitionRef.current = null
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current)
        stopTimeoutRef.current = null
      }
    }
    recognition.start()
    recognitionRef.current = recognition
  }

  const stop = () =>
    new Promise<string>((resolve) => {
      if (!recognitionRef.current) {
        resolve(liveText.trim())
        return
      }
      const recognition = recognitionRef.current
      let done = false
      const finalize = () => {
        if (done) return
        done = true
        if (stopTimeoutRef.current) {
          window.clearTimeout(stopTimeoutRef.current)
          stopTimeoutRef.current = null
        }
        recognitionRef.current = null
        resolve((finalRef.current || liveText).trim())
      }
      recognition.onend = finalize
      recognition.onerror = finalize
      stopTimeoutRef.current = window.setTimeout(finalize, 1000)
      try {
        recognition.stop()
      } catch {
        finalize()
      }
    })

  return useMemo(() => ({ liveText, supported, error, start, stop }), [liveText, supported, error])
}
