import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Brain, CheckCircle2, MessageSquare, Sparkles, Volume2, ShieldCheck, Radio } from 'lucide-react'

const PERSONAS = {
  nagma_hr: {
    name: 'Nagma HR',
    title: 'Senior Talent Acquisition Partner',
    company: 'TalentForge AI',
    photo: '/interviewers/sarah_chen.png',
    focus: 'HR introduction, soft skills, and career goals',
  },
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
}

const VIDEO_CLIPS = {
  greeting: '/interviewers/female_hr/hr_goodmorning.mp4',
  speaking: '/interviewers/female_hr/explaining.mp4',
  listening: '/interviewers/female_hr/hr_taking_notes.mp4',
  thinking: '/interviewers/female_hr/hr_looking_at_screen.mp4',
  ending: '/interviewers/female_hr/thanks_for_answering.mp4',
  idle: '/interviewers/female_hr/hr_looking_at_resume.mp4',
}

const STATE_BADGES = {
  idle: { label: 'Standby', Icon: Sparkles, bg: 'rgba(139,92,246,0.2)', text: '#A78BFA' },
  greeting: { label: 'Greeting Video', Icon: Sparkles, bg: 'rgba(245,158,11,0.2)', text: '#FBBF24' },
  speaking: { label: 'Interviewer Speaking', Icon: MessageSquare, bg: 'rgba(139,92,246,0.2)', text: '#A78BFA' },
  listening: { label: 'Active Listening', Icon: Mic, bg: 'rgba(16,185,129,0.2)', text: '#34D399' },
  thinking: { label: 'AI Evaluating Answer', Icon: Brain, bg: 'rgba(245,158,11,0.2)', text: '#FBBF24' },
  ending: { label: 'Interview Complete', Icon: CheckCircle2, bg: 'rgba(100,116,139,0.2)', text: '#94A3B8' },
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
  persona = 'nagma_hr',
  state = 'idle',
  amplitude = 0,
  speechText = '',
  questionCategory = '',
  isPressureMode = false,
  showSubtitles = true,
  onVideoEnd = () => {},
}) {
  const personaData = PERSONAS[persona] || PERSONAS.nagma_hr
  const badge = STATE_BADGES[state] || STATE_BADGES.idle
  const typedText = useTypingEffect(speechText, state === 'speaking')

  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)

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
        background: '#090d16',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* 16:9 Full-Bleed Video Stage Stream */}
      {!videoError ? (
        <video
          ref={videoRef}
          src={currentVideoSrc}
          autoPlay
          loop={state === 'listening' || state === 'thinking' || state === 'idle'}
          muted
          playsInline
          onEnded={onVideoEnd}
          onError={() => setVideoError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: state === 'thinking' ? 'brightness(0.85) contrast(1.05)' : 'none',
            transition: 'filter 0.5s ease',
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

      {/* Active Speaker Glowing Border (Purple halo when HR speaks) */}
      {state === 'speaking' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid #8b5cf6',
            boxShadow: 'inset 0 0 30px rgba(139,92,246,0.3)',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />
      )}

      {/* Top Left: Call Status & Mode Badges */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            background: badge.bg,
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <badge.Icon style={{ width: 14, height: 14, color: badge.text }} />
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: badge.text }}>
            {badge.label}
          </span>
        </div>

        {isPressureMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: 10, fontWeight: 800 }}>
            <Radio style={{ width: 12, height: 12, animation: 'pulse 1s infinite' }} />
            LIVE PROCTORED
          </div>
        )}
      </div>

      {/* Top Right: Category Pill */}
      {questionCategory && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 30,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            fontSize: 11,
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {questionCategory}
        </div>
      )}

      {/* Bottom Left: Interviewer Call Name Tag */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 16px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: state === 'speaking' ? '#8b5cf6' : '#10b981' }} />
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
          {personaData.name} — {personaData.title}
        </span>
        {state === 'speaking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 6 }}>
            <span style={{ width: 3, height: 12, background: '#8b5cf6', animation: 'bounce 0.8s infinite' }} />
            <span style={{ width: 3, height: 16, background: '#8b5cf6', animation: 'bounce 0.6s infinite' }} />
            <span style={{ width: 3, height: 10, background: '#8b5cf6', animation: 'bounce 0.9s infinite' }} />
          </div>
        )}
      </div>

      {/* Google Meet / Zoom Style Subtitles CC Overlay Bar */}
      {showSubtitles && speechText && state === 'speaking' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          style={{
            position: 'absolute',
            bottom: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '780px',
            width: '90%',
            zIndex: 35,
            padding: '12px 24px',
            borderRadius: '14px',
            background: 'rgba(9, 13, 22, 0.92)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          <span style={{ color: '#a78bfa', fontWeight: '800', marginRight: '6px' }}>CC | {personaData.name}:</span>
          "{typedText}"
        </motion.div>
      )}
    </div>
  )
}
