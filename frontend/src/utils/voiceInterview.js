const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally',
  'kind of', 'sort of', 'i mean', 'so', 'right', 'well'
]

export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function formatSeconds(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function countFillers(text = '') {
  const normalized = ` ${text.toLowerCase()} `
  return FILLER_WORDS.reduce((count, filler) => {
    const pattern = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = normalized.match(new RegExp(`\\b${pattern}\\b`, 'g'))
    return count + (matches ? matches.length : 0)
  }, 0)
}

/**
 * Detect pauses > threshold seconds in transcript timing
 * Simple heuristic: count gaps where no new words appeared for > threshold seconds
 */
export function detectPauses(wordTimestamps = [], thresholdSeconds = 2) {
  if (wordTimestamps.length < 2) return { count: 0, totalDuration: 0, longest: 0 }

  let pauseCount = 0
  let totalPauseDuration = 0
  let longestPause = 0

  for (let i = 1; i < wordTimestamps.length; i++) {
    const gap = wordTimestamps[i] - wordTimestamps[i - 1]
    if (gap >= thresholdSeconds) {
      pauseCount++
      totalPauseDuration += gap
      longestPause = Math.max(longestPause, gap)
    }
  }

  return {
    count: pauseCount,
    totalDuration: Math.round(totalPauseDuration),
    longest: Math.round(longestPause * 10) / 10,
  }
}

/**
 * Classify speaking speed into zones
 */
export function classifySpeed(wpm) {
  if (wpm === 0) return { zone: 'silent', label: 'No speech', color: 'text-gray-400' }
  if (wpm < 80) return { zone: 'slow', label: 'Too slow', color: 'text-blue-400' }
  if (wpm < 110) return { zone: 'moderate', label: 'Moderate', color: 'text-yellow-400' }
  if (wpm <= 160) return { zone: 'normal', label: 'Good', color: 'text-green-400' }
  if (wpm <= 190) return { zone: 'fast', label: 'Fast', color: 'text-orange-400' }
  return { zone: 'rushing', label: 'Rushing', color: 'text-red-400' }
}

/**
 * Detect monotone speech (low WPM variance across sentences)
 */
export function detectMonotone(transcript = '') {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length < 3) return { isMonotone: false, variance: 0 }

  const wordCounts = sentences.map(s => s.trim().split(/\s+/).length)
  const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
  const variance = wordCounts.reduce((sum, wc) => sum + Math.pow(wc - avg, 2), 0) / wordCounts.length

  // Low variance in sentence length = monotone delivery
  return {
    isMonotone: variance < 4,
    variance: Math.round(variance * 10) / 10,
  }
}

/**
 * Detect over-explaining (too long or too many words)
 */
export function detectOverExplaining(wordCount, durationSeconds) {
  return {
    isOverExplaining: durationSeconds > 120 || wordCount > 250,
    severity: durationSeconds > 180 || wordCount > 400 ? 'high' : 'moderate',
    suggestion: durationSeconds > 120
      ? 'Your answer is running long — summarize your key point.'
      : wordCount > 250
      ? 'You used many words — try to be more concise.'
      : null,
  }
}

export function analyzeVoiceTranscript({
  transcript = '',
  durationSeconds = 0,
  recognitionConfidence = 0,
}) {
  const cleanedTranscript = transcript.trim()
  const words = cleanedTranscript ? cleanedTranscript.split(/\s+/).filter(Boolean) : []
  const wordCount = words.length
  const durationMinutes = durationSeconds > 0 ? durationSeconds / 60 : 0
  const speakingPaceWpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0
  const fillerCount = countFillers(cleanedTranscript)
  const fillerRatio = wordCount > 0 ? Math.round((fillerCount / wordCount) * 100) : 0
  const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^a-z0-9]/g, '')))
  const uniqueWordRatio = wordCount > 0 ? Math.round((uniqueWords.size / wordCount) * 100) : 0
  const confidenceScore = Math.max(0, Math.min(100, Math.round(recognitionConfidence * 100)))

  const paceScore = speakingPaceWpm >= 110 && speakingPaceWpm <= 170
    ? 90
    : speakingPaceWpm >= 90 && speakingPaceWpm <= 190
      ? 72
      : speakingPaceWpm > 0
        ? 50
        : 0

  const fillerScore = fillerRatio <= 3 ? 92 : fillerRatio <= 7 ? 78 : fillerRatio <= 12 ? 60 : 40
  const deliveryScore = Math.round((paceScore * 0.4) + (fillerScore * 0.35) + (confidenceScore * 0.25))

  // Enhanced behavior analysis
  const speedZone = classifySpeed(speakingPaceWpm)
  const monotone = detectMonotone(cleanedTranscript)
  const overExplaining = detectOverExplaining(wordCount, durationSeconds)

  // Behavior flags for the UI
  const behaviorFlags = []
  if (speedZone.zone === 'rushing') behaviorFlags.push('Speaking too fast')
  if (speedZone.zone === 'slow') behaviorFlags.push('Speaking too slowly')
  if (monotone.isMonotone) behaviorFlags.push('Monotone delivery detected')
  if (overExplaining.isOverExplaining) behaviorFlags.push('Over-explaining')
  if (fillerRatio > 10) behaviorFlags.push('High filler word ratio')

  return {
    word_count: wordCount,
    speaking_pace_wpm: speakingPaceWpm,
    filler_count: fillerCount,
    filler_ratio: fillerRatio,
    unique_word_ratio: uniqueWordRatio,
    transcript_confidence: confidenceScore,
    delivery_score: deliveryScore,
    pace_score: paceScore,
    filler_score: fillerScore,
    duration_seconds: Math.max(0, Math.round(durationSeconds)),
    speed_zone: speedZone,
    is_monotone: monotone.isMonotone,
    is_over_explaining: overExplaining.isOverExplaining,
    behavior_flags: behaviorFlags,
    summary: wordCount > 0
      ? `You spoke ${wordCount} words at about ${speakingPaceWpm || 0} WPM.`
      : 'No transcript captured yet.',
  }
}