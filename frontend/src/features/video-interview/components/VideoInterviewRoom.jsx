import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, MessageSquare, FileText, Subtitles, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, PhoneOff, Sidebar } from 'lucide-react'

import HRAvatar from './HRAvatar'
import CandidateWebcam from './CandidateWebcam'
import InterviewTranscript from './InterviewTranscript'
import InterviewAnalytics from './InterviewAnalytics'
import InterviewHUD from './InterviewHUD'

import { useInterviewSession, SESSION_PHASES, AVATAR_STATES } from '../hooks/useInterviewSession'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import { useSpeechToText } from '../hooks/useSpeechToText'

const FILLER_WORDS = ['um', 'uh', 'uhh', 'umm', 'like', 'you know', 'basically', 'actually', 'literally', 'so yeah']

function countFillerWords(text) {
  if (!text) return 0
  const lower = text.toLowerCase()
  return FILLER_WORDS.reduce((count, filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lower.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
}

function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function VideoInterviewRoom({
  persona = 'nagma_hr',
  difficulty = 'Medium',
  numQuestions = 5,
  onExit = () => {},
}) {
  const isNagma = persona === 'nagma_hr' || persona === 'nagma'
  const isPressureMode = !isNagma

  const session = useInterviewSession(numQuestions)
  const {
    phase,
    avatarState,
    setAvatarState,
    currentQuestion,
    currentIndex,
    qaHistory,
    elapsedTime,
    startInterview,
    submitAnswer,
    onSpeakComplete,
    endInterview,
  } = session

  const tts = useTextToSpeech()
  const stt = useSpeechToText()

  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [totalCandidateWords, setTotalCandidateWords] = useState(0)
  const [totalFillerWords, setTotalFillerWords] = useState(0)
  const [speakingStartTime, setSpeakingStartTime] = useState(null)
  
  const [pressureTimerSeconds, setPressureTimerSeconds] = useState(60)

  const containerRef = useRef(null)
  const hasStartedRef = useRef(false)
  const hasStartedSpeakingRef = useRef(false)

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startInterview()
    }
  }, [startInterview])

  // Handle Question Arrival & Video Speech Trigger
  useEffect(() => {
    if (phase === SESSION_PHASES.ASKING && currentQuestion?.question) {
      hasStartedSpeakingRef.current = false
      setPressureTimerSeconds(60)

      setMessages(prev => [
        ...prev,
        {
          role: 'hr',
          text: currentQuestion.question,
          timestamp: Date.now(),
          category: currentQuestion.category,
        }
      ])

      if (!isMuted) {
        tts.speak(currentQuestion.question, persona)
      } else {
        setTimeout(() => onSpeakComplete(), 1500)
      }
    }
  }, [phase, currentQuestion])

  useEffect(() => {
    if (tts.isSpeaking) {
      hasStartedSpeakingRef.current = true
    }
  }, [tts.isSpeaking])

  // Stage 2: When video audio finishes speaking, HR seamlessly pauses and listens for response
  useEffect(() => {
    if (hasStartedSpeakingRef.current && !tts.isSpeaking && avatarState === AVATAR_STATES.SPEAKING && phase === SESSION_PHASES.ASKING) {
      hasStartedSpeakingRef.current = false
      onSpeakComplete()
    }
  }, [tts.isSpeaking, avatarState, phase, onSpeakComplete])

  // Auto-start Candidate Mic in Stage 2
  useEffect(() => {
    if (avatarState === AVATAR_STATES.LISTENING && stt.isSupported && !isMicOn) {
      setIsMicOn(true)
      stt.startListening()
      setSpeakingStartTime(Date.now())
    }
  }, [avatarState])

  // 60s Pressure Timer (Bar-Raiser Modes Only)
  useEffect(() => {
    let interval = null
    if (isPressureMode && avatarState === AVATAR_STATES.LISTENING) {
      interval = setInterval(() => {
        setPressureTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            handleSubmitAnswer(stt.transcript || "Time's up response.")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [avatarState, isPressureMode, stt.transcript])

  // Handle Answer Submission & Gemini AI Evaluation
  const handleSubmitAnswer = useCallback((text) => {
    const answerText = text || stt.transcript || ''
    
    if (isMicOn) {
      stt.stopListening()
      setIsMicOn(false)
    }

    const words = countWords(answerText)
    const fillers = countFillerWords(answerText)
    setTotalCandidateWords(prev => prev + words)
    setTotalFillerWords(prev => prev + fillers)

    if (answerText.trim()) {
      setMessages(prev => [
        ...prev,
        {
          role: 'candidate',
          text: answerText,
          timestamp: Date.now(),
        }
      ])
    }

    stt.reset()
    setSpeakingStartTime(null)
    submitAnswer(answerText)
  }, [stt, isMicOn, submitAnswer])

  const handleToggleMic = useCallback(() => {
    if (avatarState === AVATAR_STATES.SPEAKING || avatarState === AVATAR_STATES.GREETING) {
      return
    }
    if (isMicOn) {
      stt.stopListening()
      setIsMicOn(false)
    } else {
      stt.startListening()
      setIsMicOn(true)
      if (!speakingStartTime) setSpeakingStartTime(Date.now())
    }
  }, [isMicOn, stt, avatarState, speakingStartTime])

  const handleEndInterview = useCallback(() => {
    tts.stop()
    stt.stopListening()
    setIsMicOn(false)
    endInterview()
  }, [tts, stt, endInterview])

  if (phase === SESSION_PHASES.COMPLETE) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', background: '#090d16', color: '#f8fafc' }}>
        <Trophy style={{ width: '64px', height: '64px', color: '#10b981', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Interview Complete!</h2>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
          You answered {qaHistory.length} questions in {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
        </p>
        <button onClick={onExit} style={{ padding: '14px 28px', borderRadius: '12px', background: '#10b981', color: '#fff', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#090d16', position: 'relative', overflow: 'hidden' }}>
      <InterviewHUD
        persona={persona}
        difficulty={difficulty}
        elapsedTime={elapsedTime}
        currentIndex={currentIndex}
        totalQuestions={numQuestions}
        pressureTimerSeconds={pressureTimerSeconds}
        fillerWordCount={totalFillerWords}
        onEndInterview={handleEndInterview}
      />

      {/* Main Full-Screen 16:9 HD Video Stage Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <HRAvatar
          persona={persona}
          state={avatarState}
          amplitude={tts.amplitude}
          speechText={currentQuestion?.question}
          questionCategory={currentQuestion?.category}
          isPressureMode={isPressureMode}
          showSubtitles={showSubtitles}
          onVideoEnd={() => {
            if (avatarState === AVATAR_STATES.SPEAKING) {
              onSpeakComplete()
            }
          }}
        />

        {/* Candidate PIP Video Box (Top-Right) */}
        <CandidateWebcam enabled={isCameraOn} isSpeaking={isMicOn && !!stt.transcript} onToggle={() => setIsCameraOn(p => !p)} />

        {/* Slide-Out Transcript Side Drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '360px',
                background: 'rgba(15, 23, 42, 0.95)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <InterviewTranscript messages={messages} isAsking={phase === SESSION_PHASES.ASKING} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Google Meet / Zoom Style Glass Toolbar (Bottom Center) */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 70, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', borderRadius: 30, background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 36px rgba(0,0,0,0.6)' }}>
        {/* Toggle Mic */}
        <button
          onClick={handleToggleMic}
          disabled={avatarState === AVATAR_STATES.SPEAKING}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: isMicOn ? '#10b981' : 'rgba(239, 68, 68, 0.2)', color: isMicOn ? '#fff' : '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {isMicOn ? <Mic style={{ width: 20, height: 20 }} /> : <MicOff style={{ width: 20, height: 20 }} />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={() => setIsCameraOn(p => !p)}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: isCameraOn ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.2)', color: isCameraOn ? '#f8fafc' : '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {isCameraOn ? <Camera style={{ width: 20, height: 20 }} /> : <CameraOff style={{ width: 20, height: 20 }} />}
        </button>

        {/* Toggle Mute HR Audio */}
        <button
          onClick={() => setIsMuted(p => !p)}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: isMuted ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)', color: isMuted ? '#fbbf24' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {isMuted ? <VolumeX style={{ width: 20, height: 20 }} /> : <Volume2 style={{ width: 20, height: 20 }} />}
        </button>

        {/* Toggle CC Subtitles */}
        <button
          onClick={() => setShowSubtitles(p => !p)}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: showSubtitles ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.1)', color: showSubtitles ? '#a78bfa' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Subtitles style={{ width: 20, height: 20 }} />
        </button>

        {/* Toggle Transcript Side Drawer */}
        <button
          onClick={() => setIsDrawerOpen(p => !p)}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: isDrawerOpen ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.1)', color: isDrawerOpen ? '#60a5fa' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Sidebar style={{ width: 20, height: 20 }} />
        </button>

        {/* Submit Answer Action (When Candidate is Speaking) */}
        {avatarState === AVATAR_STATES.LISTENING && (
          <button
            onClick={() => handleSubmitAnswer(stt.transcript)}
            style={{ padding: '10px 20px', borderRadius: 20, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
          >
            Submit Answer
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={handleEndInterview}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}
        >
          <PhoneOff style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  )
}
