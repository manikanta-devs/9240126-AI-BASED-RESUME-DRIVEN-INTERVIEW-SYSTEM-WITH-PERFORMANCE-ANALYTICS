import { describe, it, expect } from 'vitest'
import {
  getSpeechRecognition,
  formatSeconds,
  countFillers,
  detectPauses,
  classifySpeed,
  detectMonotone,
  detectOverExplaining,
  analyzeVoiceTranscript,
} from '../utils/voiceInterview'

describe('voiceInterview utilities', () => {
  describe('getSpeechRecognition', () => {
    it('returns something or null in test environment', () => {
      const recognition = getSpeechRecognition()
      // In JSDOM node environment, window.SpeechRecognition might not be defined, which is fine
      expect(recognition).toBeDefined()
    })
  })

  describe('formatSeconds', () => {
    it('formats seconds to mm:ss format', () => {
      expect(formatSeconds(0)).toBe('0:00')
      expect(formatSeconds(65)).toBe('1:05')
      expect(formatSeconds(125)).toBe('2:05')
      expect(formatSeconds(-10)).toBe('0:00')
    })
  })

  describe('countFillers', () => {
    it('counts filler words correctly', () => {
      expect(countFillers('')).toBe(0)
      expect(countFillers('this is a test')).toBe(0)
      expect(countFillers('um so like actually basically')).toBe(5)
      expect(countFillers('UM like... like')).toBe(3)
    })
  })

  describe('detectPauses', () => {
    it('handles empty or single timestamp list', () => {
      expect(detectPauses([])).toEqual({ count: 0, totalDuration: 0, longest: 0 })
      expect(detectPauses([10.5])).toEqual({ count: 0, totalDuration: 0, longest: 0 })
    })

    it('detects pauses exceeding threshold', () => {
      const timestamps = [1.0, 1.5, 4.5, 5.0, 10.0]
      const pauses = detectPauses(timestamps, 2)
      expect(pauses.count).toBe(2) // 4.5-1.5=3s and 10.0-5.0=5s
      expect(pauses.totalDuration).toBe(8)
      expect(pauses.longest).toBe(5)
    })
  })

  describe('classifySpeed', () => {
    it('classifies WPM speed correctly', () => {
      expect(classifySpeed(0).zone).toBe('silent')
      expect(classifySpeed(50).zone).toBe('slow')
      expect(classifySpeed(100).zone).toBe('moderate')
      expect(classifySpeed(140).zone).toBe('normal')
      expect(classifySpeed(180).zone).toBe('fast')
      expect(classifySpeed(200).zone).toBe('rushing')
    })
  })

  describe('detectMonotone', () => {
    it('returns false for very short transcripts', () => {
      expect(detectMonotone('This is too short.').isMonotone).toBe(false)
    })

    it('detects monotone when sentences have almost same length', () => {
      const monotoneText = 'This is a long sentence indeed. This is another long sentence. This is one more sentence.'
      const res = detectMonotone(monotoneText)
      expect(res.isMonotone).toBe(true)
    })
  })

  describe('detectOverExplaining', () => {
    it('detects overexplaining with long duration or word count', () => {
      expect(detectOverExplaining(100, 30).isOverExplaining).toBe(false)
      expect(detectOverExplaining(300, 60).isOverExplaining).toBe(true)
      expect(detectOverExplaining(100, 150).isOverExplaining).toBe(true)
    })
  })

  describe('analyzeVoiceTranscript', () => {
    it('returns empty analysis for empty transcript', () => {
      const res = analyzeVoiceTranscript({ transcript: '', durationSeconds: 0 })
      expect(res.word_count).toBe(0)
      expect(res.summary).toBe('No transcript captured yet.')
    })

    it('performs full calculation on input', () => {
      const res = analyzeVoiceTranscript({
        transcript: 'This is a premium React project that has python and many other tools.',
        durationSeconds: 30,
        recognitionConfidence: 0.95
      })
      expect(res.word_count).toBe(13)
      expect(res.speaking_pace_wpm).toBe(26)
      expect(res.unique_word_ratio).toBe(100)
    })
  })
})
