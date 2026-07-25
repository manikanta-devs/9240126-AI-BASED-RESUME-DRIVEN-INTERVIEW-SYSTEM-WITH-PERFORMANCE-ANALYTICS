import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw, ArrowLeft, CheckCircle, Star, MessageSquare } from 'lucide-react'

import HRAvatar from './HRAvatar'
import CandidateWebcam from './CandidateWebcam'
import InterviewTranscript from './InterviewTranscript'
import InterviewControls from './InterviewControls'
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
  },
  mainArea: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarSection: {
    flex: '0 0 70%',
    position: 'relative',
    overflow: 'hidden',
  },
  analyticsSection: {
    flex: '0 0 30%',
    background: 'rgba(15,23,42,0.6)',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  bottomSection: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(15,23,42,0.8)',
    backdropFilter: 'blur(12px)',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)',
    borderRadius: '16px',
    overflow: 'auto',
  },
  resultsTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: '8px',
  },
  resultsSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '32px',
  },
  qaList: {
    width: '100%',
    maxWidth: '700px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
    textAlign: 'left',
  },
  qaCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px',
  },
  qaQuestion: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  qaAnswer: {
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.5',
    paddingLeft: '24px',
  },
  qaCategory: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 8px',
    borderRadius: '4px',
    background: 'rgba(139,92,246,0.15)',
    color: '#A78BFA',
    marginLeft: 'auto',
    flexShrink: 0,
  },
}

export default function VideoInterviewRoom({
  persona = 'sarah',
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
    resetSession,
  } = session

  const tts = useTextToSpeech()
  const stt = useSpeechToText()

  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState([])
  const [totalCandidateWords, setTotalCandidateWords] = useState(0)
  const [totalFillerWords, setTotalFillerWords] = useState(0)
  const [speakingStartTime, setSpeakingStartTime] = useState(null)
  
  // Pressure timer state (60s countdown)
  const [pressureTimerSeconds, setPressureTimerSeconds] = useState(60)
  
  const containerRef = useRef(null)
  const hasStartedRef = useRef(false)
  const hasStartedSpeakingRef = useRef(false)

  // Start session on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startInterview()
    }
  }, [startInterview])

  // Handle Question Arrival & Speech Trigger
  useEffect(() => {
    if (phase === SESSION_PHASES.ASKING && currentQuestion?.question) {
      hasStartedSpeakingRef.current = false;
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

  // Track when TTS actually starts speaking
  useEffect(() => {
    if (tts.isSpeaking) {
      hasStartedSpeakingRef.current = true
    }
  }, [tts.isSpeaking])

  // Transition from SPEAKING -> LISTENING ONLY after TTS has started AND completed
  useEffect(() => {
    if (hasStartedSpeakingRef.current && !tts.isSpeaking && avatarState === AVATAR_STATES.SPEAKING && phase === SESSION_PHASES.ASKING) {
      hasStartedSpeakingRef.current = false
      onSpeakComplete()
    }
  }, [tts.isSpeaking, avatarState, phase, onSpeakComplete])

  // Auto-start microphone when LISTENING phase begins
  useEffect(() => {
    if (avatarState === AVATAR_STATES.LISTENING && stt.isSupported && !isMicOn) {
      setIsMicOn(true)
      stt.startListening()
      setSpeakingStartTime(Date.now())
    }
  }, [avatarState])

  // 60-Second Pressure Countdown Timer (Pressure Mode Only)
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

  // Handle answer submission
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
      <motion.div style={styles.resultsContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Trophy style={{ width: '56px', height: '56px', color: '#8B5CF6', marginBottom: '16px' }} />
        <h2 style={styles.resultsTitle}>Interview Complete!</h2>
        <p style={styles.resultsSubtitle}>
          You answered {qaHistory.length} questions in {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
        </p>

        <div style={styles.qaList}>
          {qaHistory.map((qa, idx) => (
            <div key={idx} style={styles.qaCard}>
              <div style={styles.qaQuestion}>
                <MessageSquare style={{ width: '14px', height: '14px' }} />
                <span>Q{idx + 1}: {qa.question}</span>
              </div>
              <div style={styles.qaAnswer}>{qa.answer || '(No answer recorded)'}</div>
            </div>
          ))}
        </div>

        <button onClick={onExit} style={{ padding: '12px 24px', borderRadius: '12px', background: '#8B5CF6', color: '#fff', fontWeight: 'bold' }}>
          Back to Dashboard
        </button>
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} style={styles.container}>
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

      <div style={styles.mainArea}>
        <div style={styles.avatarSection}>
          <HRAvatar
            persona={persona}
            state={avatarState}
            amplitude={tts.amplitude}
            speechText={currentQuestion?.question}
            questionCategory={currentQuestion?.category}
            isPressureMode={isPressureMode}
          />

          <CandidateWebcam enabled={isCameraOn} onToggle={() => setIsCameraOn(p => !p)} />
        </div>

        <div style={styles.analyticsSection}>
          <InterviewAnalytics
            avatarState={avatarState}
            isMicActive={isMicOn}
            currentCategory={currentQuestion?.category}
            currentDifficulty={difficulty}
            totalWords={totalCandidateWords}
            totalFillers={totalFillerWords}
          />
        </div>
      </div>

      <div style={styles.bottomSection}>
        <InterviewTranscript messages={messages} isAsking={phase === SESSION_PHASES.ASKING} />
        <InterviewControls
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          isMuted={isMuted}
          state={avatarState}
          transcriptText={stt.transcript}
          onToggleMic={handleToggleMic}
          onToggleCamera={() => setIsCameraOn(p => !p)}
          onToggleMute={() => setIsMuted(p => !p)}
          onSubmitAnswer={handleSubmitAnswer}
        />
      </div>
    </div>
  )
}
