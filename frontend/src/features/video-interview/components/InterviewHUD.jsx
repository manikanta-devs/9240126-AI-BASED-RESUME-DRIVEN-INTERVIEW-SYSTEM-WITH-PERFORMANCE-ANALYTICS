import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Video, Clock, X, AlertCircle, Wifi, Lightbulb } from 'lucide-react'

const PERSONAS = {
  nagma_hr: {
    name: 'Nagma HR',
    title: 'Senior Talent Acquisition Partner',
    photo: '/interviewers/sarah_chen.png',
  },
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
}

export default function InterviewHUD({
  persona = 'nagma_hr',
  difficulty = 'Medium',
  elapsedTime = 0,
  currentIndex = 0,
  totalQuestions = 5,
  pressureTimerSeconds = 60,
  fillerWordCount = 0,
  onEndInterview = () => {},
}) {
  const isNagma = persona === 'nagma_hr' || persona === 'nagma'
  const isPressureMode = !isNagma
  const personaData = PERSONAS[persona] || PERSONAS.nagma_hr

  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedTime / 60).toString().padStart(2, '0')
    const secs = (elapsedTime % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }, [elapsedTime])

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
        padding: '0 20px',
        background: 'rgba(9, 13, 22, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        zIndex: 50,
      }}
    >
      {/* Left: Persona Chip & Network Quality Widget */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={personaData.photo}
            alt={personaData.name}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(139,92,246,0.5)' }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>{personaData.name}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{personaData.title}</div>
          </div>
        </div>

        {/* 5G Enterprise Network Quality Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 14, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontSize: 10, fontWeight: 700 }}>
          <Wifi style={{ width: 12, height: 12 }} /> 5G HD • 1080p
        </div>
      </div>

      {/* Center: AI STAR Guidance Tip Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', fontSize: 11, fontWeight: 700 }}>
        <Lightbulb style={{ width: 14, height: 14, color: '#fcf003' }} />
        <span>STAR Tip: Highlight Situation, Task, Action & Result</span>
      </div>

      {/* Right: Pressure Timer, Progress & End Call */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isPressureMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '14px', background: 'rgba(15,23,42,0.9)', border: `1px solid ${pressureColor}` }}>
            <Clock style={{ width: 14, height: 14, color: pressureColor }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: pressureColor, fontFamily: 'monospace' }}>
              00:{pressureTimerSeconds.toString().padStart(2, '0')}
            </span>
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
          {formattedTime}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0' }}>
          Q{currentIndex + 1} / {totalQuestions}
        </div>

        <button
          onClick={onEndInterview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          }}
        >
          <X style={{ width: 14, height: 14 }} /> Leave Call
        </button>
      </div>
    </motion.header>
  )
}
