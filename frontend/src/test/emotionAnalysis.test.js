import { describe, it, expect } from 'vitest'
import { createEmotionSnapshot } from '../utils/emotionAnalysis'

describe('createEmotionSnapshot', () => {
  it('handles empty history', () => {
    const snapshot = createEmotionSnapshot([])
    expect(snapshot.primary_emotion).toBe('uncertain')
    expect(snapshot.posture_label).toBe('Good')
    expect(snapshot.posture_score).toBe(0)
  })

  it('calculates Good posture when centered', () => {
    const history = [
      { brightness: 120, motion: 0.1, centerBias: 0.8, xCentroid: 47.5, yCentroid: 26.5 }
    ]
    const snapshot = createEmotionSnapshot(history)
    expect(snapshot.posture_label).toBe('Good')
    expect(snapshot.posture_score).toBe(100)
  })

  it('calculates Slouched posture when yCentroid is high', () => {
    // yCenter is 26.5. (yCentroidAvg - yCenter) / yCenter > 0.08 means yCentroid > 28.62
    const history = [
      { brightness: 120, motion: 0.1, centerBias: 0.8, xCentroid: 47.5, yCentroid: 30.0 }
    ]
    const snapshot = createEmotionSnapshot(history)
    expect(snapshot.posture_label).toBe('Slouched')
    expect(snapshot.posture_score).toBeLessThan(100)
  })

  it('calculates Leaning Left posture when xCentroid is low', () => {
    // xCenter is 47.5. (xCentroidAvg - xCenter) / xCenter < -0.06 means xCentroid < 44.65
    const history = [
      { brightness: 120, motion: 0.1, centerBias: 0.8, xCentroid: 40.0, yCentroid: 26.5 }
    ]
    const snapshot = createEmotionSnapshot(history)
    expect(snapshot.posture_label).toBe('Leaning Left')
    expect(snapshot.posture_score).toBeLessThan(100)
  })

  it('calculates Leaning Right posture when xCentroid is high', () => {
    // xCenter is 47.5. (xCentroidAvg - xCenter) / xCenter > 0.06 means xCentroid > 50.35
    const history = [
      { brightness: 120, motion: 0.1, centerBias: 0.8, xCentroid: 55.0, yCentroid: 26.5 }
    ]
    const snapshot = createEmotionSnapshot(history)
    expect(snapshot.posture_label).toBe('Leaning Right')
    expect(snapshot.posture_score).toBeLessThan(100)
  })

  it('respects dynamic custom calibrated center coordinates', () => {
    // If center is calibrated off-center (e.g. xCenter=60.0, yCenter=35.0)
    // and history matches it, it should evaluate to Good posture.
    const history = [
      { brightness: 120, motion: 0.1, centerBias: 0.8, xCentroid: 60.0, yCentroid: 35.0 }
    ]
    const snapshot = createEmotionSnapshot(history, 60.0, 35.0)
    expect(snapshot.posture_label).toBe('Good')
    expect(snapshot.posture_score).toBe(100)
  })
})
