import { useState, useEffect, useRef } from 'react'

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimResult, setInterimResult] = useState('')
  const [error, setError] = useState(null)
  
  const recognitionRef = useRef(null)
  const isSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SpeechRecognition()
    recognitionRef.current = rec

    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    rec.onresult = (event) => {
      let finalSpeech = ''
      let interimSpeech = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript + ' '
        } else {
          interimSpeech += event.results[i][0].transcript
        }
      }

      if (finalSpeech) {
        setTranscript(prev => prev + finalSpeech)
      }
      setInterimResult(interimSpeech)
    }

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(event.error)
      
      // If mic permissions are denied, stop listening
      if (event.error === 'not-allowed') {
        setIsListening(false)
      }
    }

    rec.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isSupported])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || isListening) return
    
    setTranscript('')
    setInterimResult('')
    setError(null)
    try {
      recognitionRef.current.start()
    } catch (e) {
      console.warn('Speech recognition start failed:', e)
    }
  }

  const stopListening = () => {
    if (!isSupported || !recognitionRef.current || !isListening) return
    
    try {
      recognitionRef.current.stop()
    } catch (e) {
      console.warn('Speech recognition stop failed:', e)
    }
  }

  const reset = () => {
    setTranscript('')
    setInterimResult('')
    setError(null)
  }

  return {
    isListening,
    transcript,
    interimResult,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  }
}
