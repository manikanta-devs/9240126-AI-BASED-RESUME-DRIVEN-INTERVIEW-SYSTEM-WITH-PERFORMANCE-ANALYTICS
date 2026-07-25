import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Video, Clock, X, AlertCircle } from 'lucide-react'

const PERSONAS = {
  sarah: {
    name: 'Sarah Chen',
    title: 'Senior HR Director',
    photo: '/interviewers/sarah_chen.png',
  },
  marcus: {
    name: 'Marcus Rodriguez',
    title: 'Technical Lead',
    photo: '/interviewers/marcus_rodriguez.png',
  },
  nagma_hr: {
    name: 'Nagma HR',
    title: 'Senior Talent Acquisition Partner',
    photo: '/interviewers/sarah_chen.png',
  }
}

const getDifficultyStyle = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return {
        bg: 'rgba(34, 197, 94, 0.1)',
        text: '#4ADE80',
        border: 'rgba(34, 197, 94, 0.25)',
        dot: '#22C55E',
      }
    case 'Hard':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#FCA5A5',
        border: 'rgba(239, 68, 68, 0.25)',
        dot: '#EF4444',
      }
    case 'Medium':
    default:
      return {
        bg: 'rgba(245, 158, 11, 0.1)',
        text: '#FCD34D',
        border: 'rgba(245, 158, 11, 0.25)',
        dot: '#F59E0B',
      }
  }
}

export default function InterviewHUD({
  persona = 'sarah',
  difficulty = 'Medium',
  elapsedTime = 0,
  currentIndex = 0,
  totalQuestions = 5,
  isActive = true,
  pressureTimerSeconds = 60,
  fillerWordCount = 0,
  onEndInterview = () => {},
}) {
  const isNagma = persona === 'nagma_hr' || persona === 'nagma'
  const isPressureMode = !isNagma

  const personaData = PERSONAS[persona] || PERSONAS.sarah

  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedTime / 60)
      .toString()
      .padStart(2, '0')
    const secs = (elapsedTime % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }, [elapsedTime])

  const diffStyle = getDifficultyStyle(difficulty)

  // Pressure timer color calculations
  const pressureColor = pressureTimerSeconds <= 10 ? '#ef4444' : pressureTimerSeconds <= 25 ? '#f59e0b' : '#3b82f6'

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        padding: '0 16px',
        background: 'rgba(15, 23, 42, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}
    >
      {/* Left: Persona Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={personaData.photo}
            alt={personaData.name}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(139,92,246,0.5)' }}
          />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#f1f5f9' }}>{personaData.name}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{personaData.title}</div>
          </div>
        </div>

        {/* Mode Badge */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px',
            background: isPressureMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isPressureMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: isPressureMode ? '#f87171' : '#34d399',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {isPressureMode ? 'High-Pressure Mode' : 'Friendly Support Mode'}
        </span>
      </div>

      {/* Center: Live Pressure Indicators (Pressure Mode Only) */}
      {isPressureMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Countdown Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '14px', background: 'rgba(15,23,42,0.9)', border: `1px solid ${pressureColor}` }}>
            <Clock style={{ width: 14, height: 14, color: pressureColor }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: pressureColor, fontFamily: 'monospace' }}>
              00:{pressureTimerSeconds.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Filler Word Counter */}
          {fillerWordCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '11px', fontWeight: 700 }}>
              <AlertCircle style={{ width: 12, height: 12 }} />
              {fillerWordCount} Filler Word{fillerWordCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Right: Timer, Progress & End Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
          {formattedTime}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
          Question {currentIndex + 1} of {totalQuestions}
        </div>

        <button
          onClick={onEndInterview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <X style={{ width: 14, height: 14 }} /> End
        </button>
      </div>
    </motion.header>
  )
}
