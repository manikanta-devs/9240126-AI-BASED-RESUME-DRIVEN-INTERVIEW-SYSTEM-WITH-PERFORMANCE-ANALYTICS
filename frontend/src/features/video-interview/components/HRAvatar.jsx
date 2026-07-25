import React, { useMemo, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Brain, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react'

const PERSONAS = {
  sarah: {
    name: 'Sarah Chen',
    title: 'Senior HR Director',
    company: 'TalentForge AI',
    photo: '/interviewers/sarah_chen.png',
    focus: 'Cultural alignment, behavioral scenarios, leadership',
  },
  marcus: {
    name: 'Marcus Rodriguez',
    title: 'Technical Lead',
    company: 'TalentForge AI',
    photo: '/interviewers/marcus_rodriguez.png',
    focus: 'Technical workflows, system design, debugging',
  },
  nagma_hr: {
    name: 'Nagma HR',
    title: 'Senior Talent Acquisition Partner',
    company: 'TalentForge AI',
    photo: '/interviewers/sarah_chen.png',
    focus: 'Supportive background introduction, career goals, soft skills',
  }
}

// MP4 Video Source Mappings for Video Avatar
const VIDEO_CLIPS = {
  greeting: '/interviewers/female_hr/hr_goodmorning.mp4',
  speaking: '/interviewers/female_hr/explaining.mp4',
  listening: '/interviewers/female_hr/hr_taking_notes.mp4',
  thinking: '/interviewers/female_hr/hr_looking_at_screen.mp4',
  ending: '/interviewers/female_hr/thanks_for_answering.mp4',
  idle: '/interviewers/female_hr/hr_looking_at_resume.mp4',
}

const STATE_GLOW = {
  idle: { color: '#8B5CF6', shadow: 'rgba(139,92,246,0.25)' },
  greeting: { color: '#F59E0B', shadow: 'rgba(245,158,11,0.30)' },
  speaking: { color: '#8B5CF6', shadow: 'rgba(139,92,246,0.35)' },
  listening: { color: '#10B981', shadow: 'rgba(16,185,129,0.35)' },
  thinking: { color: '#F59E0B', shadow: 'rgba(245,158,11,0.30)' },
  ending: { color: '#64748B', shadow: 'rgba(100,116,139,0.15)' },
}

const STATE_BADGES = {
  idle: { label: 'Ready', Icon: Sparkles, bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#A78BFA' },
  greeting: { label: 'Greeting', Icon: Sparkles, bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#FBBF24' },
  speaking: { label: 'Speaking', Icon: MessageSquare, bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#A78BFA' },
  listening: { label: 'Listening', Icon: Mic, bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#34D399' },
  thinking: { label: 'Analyzing', Icon: Brain, bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#FBBF24' },
  ending: { label: 'Complete', Icon: CheckCircle2, bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)', text: '#94A3B8' },
}

function useTypingEffect(text, isActive) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    if (!isActive || !text) return

    const tick = () => {
      if (indexRef.current < text.length) {
        const char = text[indexRef.current]
        indexRef.current += 1
        setDisplayed(text.slice(0, indexRef.current))
        const delay = /[.,;:!?]/.test(char) ? 80 : 28
        timerRef.current = setTimeout(tick, delay)
      }
    }

    timerRef.current = setTimeout(tick, 120)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, isActive])

  return displayed
}

export default function HRAvatar({
  persona = 'sarah',
  state = 'idle',
  amplitude = 0,
  speechText = '',
  questionCategory = '',
  isPressureMode = false,
}) {
  const personaData = PERSONAS[persona] || PERSONAS.sarah
  const glow = STATE_GLOW[state] || STATE_GLOW.idle
  const badge = STATE_BADGES[state] || STATE_BADGES.idle
  const typedText = useTypingEffect(speechText, state === 'speaking')

  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)

  // Current video clip source based on state
  const currentVideoSrc = VIDEO_CLIPS[state] || VIDEO_CLIPS.idle

  useEffect(() => {
    setVideoError(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => setVideoError(true))
      }
    }
  }, [state, currentVideoSrc])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '24px',
        border: isPressureMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,1) 60%, rgba(10,15,30,1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Background ambient glow */}
      <motion.div
        animate={{
          opacity: state === 'ending' ? 0.15 : 0.45,
          scale: state === 'speaking' ? 1.15 : 1,
        }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${glow.shadow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Proctored indicator badge (Pressure mode only) */}
      {isPressureMode && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
          LIVE PROCTORED INTERVIEW
        </div>
      )}

      {/* Status badge pill (top-left) */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          borderRadius: 20,
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <badge.Icon style={{ width: 12, height: 12, color: badge.text }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: badge.text,
          }}
        >
          {badge.label}
        </span>
      </motion.div>

      {/* Category pill (top-right) */}
      {questionCategory && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 30,
            padding: '5px 12px',
            borderRadius: 20,
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            fontSize: 9,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#94a3b8',
          }}
        >
          {questionCategory}
        </div>
      )}

      {/* Outer Video Glow Container */}
      <motion.div
        animate={{
          boxShadow: state === 'speaking'
            ? `0 0 60px 15px ${glow.shadow}, inset 0 0 40px 8px ${glow.shadow}`
            : `0 0 40px 8px ${glow.shadow}`,
          scale: state === 'listening' ? [1, 1.02, 1] : 1,
        }}
        transition={{ duration: 1.8, repeat: state === 'listening' ? Infinity : 0, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: `2px solid ${glow.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          zIndex: 10,
          overflow: 'hidden'
        }}
      >
        {!videoError ? (
          <video
            ref={videoRef}
            src={currentVideoSrc}
            autoPlay
            loop={state === 'listening' || state === 'thinking' || state === 'idle'}
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          <img
            src={personaData.photo}
            alt={personaData.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </motion.div>

      {/* Speech Text Overlay */}
      {speechText && state === 'speaking' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 24,
            zIndex: 30,
            padding: '12px 18px',
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(12px)',
            color: '#f1f5f9',
            fontSize: '13px',
            lineHeight: '1.5',
            textAlign: 'center',
          }}
        >
          "{typedText}"
        </motion.div>
      )}
    </div>
  )
}
