import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  ArrowRight,
  Video,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  User,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  Target,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import VideoInterviewRoom from './components/VideoInterviewRoom'

const PERSONAS = {
  nagma_hr: {
    id: 'nagma_hr',
    name: 'Nagma HR',
    title: 'Senior Talent Acquisition Partner',
    company: 'TalentForge AI',
    photo: '/interviewers/sarah_chen.png',
    focus: 'Specializes in background walkthroughs, soft skills, core career motivations, and supportive behavioral guidance.',
    accentColor: '#10B981',
    accentBg: 'rgba(16,185,129,0.15)',
    skills: ['HR Introduction', 'Career Goals', 'Behavioral', 'Soft Skills'],
    badge: 'Friendly & Supportive'
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah Chen',
    title: 'Senior HR Director',
    company: 'TalentForge AI',
    photo: '/interviewers/sarah_chen.png',
    focus: 'Focuses on cultural alignment, core motivations, leadership qualities, and structured behavioral scenarios.',
    accentColor: '#8B5CF6',
    accentBg: 'rgba(139,92,246,0.15)',
    skills: ['Behavioral', 'Leadership', 'Culture Fit', 'Soft Skills'],
    badge: 'Standard HR'
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Rodriguez',
    title: 'Technical Lead',
    company: 'TalentForge AI',
    photo: '/interviewers/marcus_rodriguez.png',
    focus: 'Dives deep into software engineering workflows, systems design choices, bug diagnosis, and project architecture.',
    accentColor: '#06B6D4',
    accentBg: 'rgba(6,182,212,0.15)',
    skills: ['Technical', 'System Design', 'Debugging', 'Architecture'],
    badge: 'Bar-Raiser Technical'
  },
}

const DIFFICULTIES = [
  { value: 'Easy', color: '#22c55e', label: 'Easy', desc: 'Introductory questions' },
  { value: 'Medium', color: '#eab308', label: 'Medium', desc: 'Standard interview' },
  { value: 'Hard', color: '#ef4444', label: 'Hard', desc: 'Senior-level depth' },
]

const glassCard = {
  background: 'rgba(15,23,42,0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
}

const pageContainer = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '24px',
  gap: '24px',
  overflowY: 'auto',
}

function NoResumeScreen() {
  const navigate = useNavigate()

  return (
    <motion.div
      style={{
        ...pageContainer,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{
          ...glassCard,
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
        }}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
        }}>
          <FileText style={{ width: '36px', height: '36px', color: '#a78bfa' }} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', marginBottom: '12px' }}>
          Resume Required
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '32px' }}>
          To generate personalized, context-aware interview questions with our AI avatars, please upload your resume first.
        </p>

        <button
          onClick={() => navigate('/dashboard/resume')}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
          }}
        >
          <span>Upload Resume Now</span>
          <ArrowRight style={{ width: '18px', height: '18px' }} />
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function VideoInterviewPage() {
  const { resumeData } = useApp()
  const [selectedPersona, setSelectedPersona] = useState('nagma_hr')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')
  const [numQuestions, setNumQuestions] = useState(5)
  const [isInRoom, setIsInRoom] = useState(false)

  const handleStart = useCallback(() => {
    setIsInRoom(true)
  }, [])

  const handleExitRoom = useCallback(() => {
    setIsInRoom(false)
  }, [])

  if (!resumeData) {
    return <NoResumeScreen />
  }

  if (isInRoom) {
    return (
      <VideoInterviewRoom
        persona={selectedPersona}
        difficulty={selectedDifficulty}
        numQuestions={numQuestions}
        onExit={handleExitRoom}
      />
    )
  }

  return (
    <div style={pageContainer}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
          1080p Real AI Video Interview Call Stage
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
          Experience a full-screen 16:9 Google Meet & Zoom style HD AI video interview call.
        </p>
      </motion.div>

      {/* Select Persona */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {Object.values(PERSONAS).map((persona) => {
          const isSelected = selectedPersona === persona.id
          return (
            <motion.div
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              style={{
                ...glassCard,
                padding: '24px',
                cursor: 'pointer',
                border: isSelected ? `2px solid ${persona.accentColor}` : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected ? `0 0 24px ${persona.accentColor}33` : 'none',
                position: 'relative',
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <img
                  src={persona.photo}
                  alt={persona.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${persona.accentColor}` }}
                />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{persona.name}</h3>
                  <div style={{ fontSize: '12px', color: persona.accentColor, fontWeight: '600', marginTop: '2px' }}>{persona.title}</div>
                  <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', background: persona.accentBg, color: persona.accentColor, display: 'inline-block', marginTop: '6px' }}>
                    {persona.badge}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>{persona.focus}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Setup Options & Start */}
      <div style={{ ...glassCard, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>Difficulty Level</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDifficulty(d.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: selectedDifficulty === d.value ? `1.5px solid ${d.color}` : '1px solid rgba(255,255,255,0.08)',
                  background: selectedDifficulty === d.value ? `${d.color}22` : 'rgba(255,255,255,0.03)',
                  color: selectedDifficulty === d.value ? d.color : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{
            padding: '16px 36px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Video style={{ width: '20px', height: '20px' }} />
          <span>Launch 1080p Video Call Stage</span>
        </button>
      </div>
    </div>
  )
}
