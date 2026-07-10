import { useState, useEffect, useRef } from 'react'

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [amplitude, setAmplitude] = useState(0)
  const synthRef = useRef(window.speechSynthesis)
  const utteranceRef = useRef(null)
  const animFrameRef = useRef(null)

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  // Speech Amplitude Simulator (Simulates syllables/pulses of speech)
  const startAmplitudeSimulation = () => {
    let t = 0
    const simulate = () => {
      if (synthRef.current && synthRef.current.speaking) {
        t += 0.25
        // Generate a syllable-like wave: combination of sine waves + noise pulses
        const baseWave = Math.sin(t * 0.8) * Math.cos(t * 0.3)
        // Add random consonant spikes/drops
        const randomSpike = Math.random() > 0.85 ? 0.3 : 0
        const randomDrop = Math.random() > 0.9 ? 0.1 : 1.0
        
        let amp = (Math.abs(baseWave) * 0.6 + randomSpike) * randomDrop
        amp = Math.max(0, Math.min(0.7, amp)) // clamp between 0.0 and 0.7
        
        // Every few frames, simulate a pause between words
        if (Math.sin(t * 0.15) > 0.85) {
          amp = 0
        }
        
        setAmplitude(amp)
        animFrameRef.current = requestAnimationFrame(simulate)
      } else {
        setAmplitude(0)
        setIsSpeaking(false)
      }
    }
    animFrameRef.current = requestAnimationFrame(simulate)
  }

  const speak = (text, persona = 'sarah') => {
    if (!synthRef.current) return

    // Cancel any current speaking
    synthRef.current.cancel()
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }

    setIsSpeaking(true)
    setAmplitude(0)

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Choose voice based on persona (sarah = female, marcus = male)
    const voices = synthRef.current.getVoices()
    let selectedVoice = null

    if (persona === 'sarah') {
      // Find female-sounding English voice
      selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google US English') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.toLowerCase().includes('female')))
    } else {
      // Find male-sounding English voice
      selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google UK English Male') || v.name.includes('David') || v.name.includes('Google India English') || v.name.toLowerCase().includes('male')))
    }

    // Fallback: use first English voice or any default voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0]
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Speech parameters
    utterance.rate = 1.0  // standard pace
    utterance.pitch = persona === 'sarah' ? 1.05 : 0.95 // slightly adjust pitch per persona

    utterance.onstart = () => {
      setIsSpeaking(true)
      startAmplitudeSimulation()
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setAmplitude(0)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }

    utterance.onerror = (e) => {
      console.warn('TTS utterance encountered an error:', e)
      setIsSpeaking(false)
      setAmplitude(0)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }

    synthRef.current.speak(utterance)
  }

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsSpeaking(false)
    setAmplitude(0)
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
  }

  return { speak, stop, isSpeaking, amplitude }
}
