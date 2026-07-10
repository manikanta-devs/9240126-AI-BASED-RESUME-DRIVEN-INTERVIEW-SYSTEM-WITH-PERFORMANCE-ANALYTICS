import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, Briefcase, Zap, AlertCircle, ArrowLeft,
  RefreshCw, Award, Clock, ChevronRight, CheckCircle, Flame
} from 'lucide-react'
import { useInterviewSession, SESSION_PHASES } from './hooks/useInterviewSession'
import { useTextToSpeech } from './hooks/useTextToSpeech'
import { useSpeechToText } from './hooks/useSpeechToText'
import HRAvatar from './components/HRAvatar'
import InterviewControls from './components/InterviewControls'

const PERSONAS = {
  sarah: {
    name: 'Sarah Chen',
    title: 'Senior HR Director',
    company: 'TalentForge AI',
    desc: 'Focuses on cultural alignment, core motivations, leadership qualities, and structured behavioral scenarios.',
    image: '/interviewers/sarah_chen.png',
    bgGradient: 'from-pink-500/10 via-purple-500/5 to-transparent',
    accentColor: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-500/25',
    buttonColor: 'bg-fuchsia-600 hover:bg-fuchsia-500'
  },
  marcus: {
    name: 'Marcus Rodriguez',
    title: 'Technical Lead',
    company: 'TalentForge AI',
    desc: 'Dives deep into software engineering workflows, systems design choices, bug diagnosis, and project architecture.',
    image: '/interviewers/marcus_rodriguez.png',
    bgGradient: 'from-cyan-500/10 via-indigo-500/5 to-transparent',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/25',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-500'
  }
}

export default function VideoInterviewPage() {
  const navigate = useNavigate()
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [numQuestions] = useState(5)
  const [manualAnswerText, setManualAnswerText] = useState('')

  // Hooks
  const {
    phase,
    setPhase,
    qaHistory,
    currentQuestion,
    currentIndex,
    elapsedTime,
    startInterview,
    submitAnswer,
    resetInterview
  } = useInterviewSession(numQuestions)

  const { speak, stop: stopTTS, isSpeaking, amplitude } = useTextToSpeech()
  
  const {
    isListening,
    transcript,
    interimResult,
    error: micError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    reset: resetSTT,
  } = useSpeechToText()

  // Real-time STAR method checker logic
  const checkStar = (val) => {
    const v = val.toLowerCase()
    return {
      s: /\b(when|during|working|previous|at\s+company|the\s+problem|background|context|situation|team|project|role)\b/.test(v),
      t: /\b(tasked|responsible|needed\s+to|had\s+to|goal|objective|challenge|requirements)\b/.test(v),
      a: /\b(built|implemented|designed|wrote|created|optimized|developed|engineered|refactored|debugged|integrated|migrated|configured|tested|resolved)\b/.test(v),
      r: /%|\b(percent|increased|reduced|saved|seconds|ms|improvement|boosted|decreased|resulted|optimized\s+by|throughput|latency|metrics)\b/.test(v) || /\b\d+\s*(%|percent|x|seconds|ms|users|requests)\b/.test(v)
    }
  }

  // Calculate current STAR status based on speech transcript or typed fallback
  const currentAnswerValue = (!isSpeechSupported || micError === 'not-allowed') ? manualAnswerText : transcript
  const starStatus = checkStar(currentAnswerValue)

  // Watch for phase transitions to orchestrate speech flow
  useEffect(() => {
    if (phase === SESSION_PHASES.ASKING && currentQuestion) {
      // Clear transcript and reset STT for new question
      resetSTT()
      setManualAnswerText('')
      // Avatar speaks the question
      speak(currentQuestion.question, selectedPersona)
    }
  }, [phase, currentQuestion])

  // Automatically start listening once avatar finishes speaking
  useEffect(() => {
    if (phase === SESSION_PHASES.ASKING && !isSpeaking && currentQuestion) {
      setPhaseListening()
    }
  }, [isSpeaking])

  const setPhaseListening = () => {
    // Only transition if currently asking (and speech has completed)
    if (phase === SESSION_PHASES.ASKING) {
      // Stop speech just in case
      stopTTS()
      // Update state machine phase to LISTENING
      setPhase(SESSION_PHASES.LISTENING)
      // Start microphone transcription
      startListening()
    }
  }

  const handleDoneAnswering = () => {
    stopListening()
    const finalAnswer = (!isSpeechSupported || micError === 'not-allowed') ? manualAnswerText : transcript
    submitAnswer(finalAnswer)
  }

  const handleStartSession = async (personaKey) => {
    setSelectedPersona(personaKey)
    await startInterview()
  }

  const handleExit = () => {
    stopTTS()
    stopListening()
    resetInterview()
    setSelectedPersona(null)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ─── STAGE 1: PERSONA SELECTION ───────────────────────────────────────────
  if (phase === SESSION_PHASES.IDLE) {
    return (
      <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto select-none">
        
        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            3D HR Avatar Placement Interview
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Conduct a dynamic voice-driven mock interview with our interactive 3D virtual recruiters.
          </p>
        </div>

        {/* Persona grid selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto my-auto py-4">
          {Object.entries(PERSONAS).map(([key, data]) => (
            <div 
              key={key}
              className={`rounded-3xl border border-white/[0.06] bg-slate-900/40 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/10 relative overflow-hidden`}
            >
              {/* background dynamic aura */}
              <div className={`absolute inset-0 bg-gradient-to-br ${data.bgGradient} opacity-40`} />
              
              <div className="relative z-10">
                {/* Photo & Identity row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${data.borderColor} shadow-lg`}>
                    <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">{data.name}</h2>
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${data.accentColor}`}>
                      {data.title}
                    </span>
                    <span className="text-[9px] text-gray-400 block font-bold mt-0.5">{data.company}</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 font-medium leading-relaxed mb-6">
                  {data.desc}
                </p>
              </div>

              <button
                onClick={() => handleStartSession(key)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${data.buttonColor} relative z-10 flex items-center justify-center gap-1.5`}
              >
                <span>Select & Start Interview</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    )
  }

  // ─── STAGE 3: INTERVIEW LOG SUMMARY ───────────────────────────────────────
  if (phase === SESSION_PHASES.COMPLETE) {
    const persona = PERSONAS[selectedPersona]
    return (
      <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider">Interview Completed</h1>
              <p className="text-[10px] text-gray-400 font-bold">Session logs recorded successfully</p>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-bold text-gray-300 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Overview Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-4xl w-full mx-auto select-none">
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-black">Time Spent</span>
              <span className="text-xs font-black text-white">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-black">Interviewer</span>
              <span className="text-xs font-black text-white">{persona.name}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-black">Questions</span>
              <span className="text-xs font-black text-white">{numQuestions} / {numQuestions}</span>
            </div>
          </div>
        </div>

        {/* Q&A logs */}
        <div className="max-w-4xl w-full mx-auto flex flex-col gap-4 mt-2">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Q&A Dialogue Log</h2>
          {qaHistory.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 flex flex-col gap-3.5">
              
              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 mt-0.5">
                  <img src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{persona.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[8px] font-bold text-gray-400 uppercase">{item.category}</span>
                  </div>
                  <p className="text-xs font-bold text-white leading-relaxed">{item.question}</p>
                </div>
              </div>

              {/* Answer */}
              <div className="flex items-start gap-3 border-t border-white/5 pt-3.5">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 shrink-0 flex items-center justify-center text-[9px] font-black text-indigo-400 mt-0.5">
                  ME
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block mb-0.5">Your Response</span>
                  <p className="text-xs font-medium text-gray-300 leading-relaxed italic">
                    "{item.answer}"
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Retry row */}
        <div className="flex justify-center py-6">
          <button
            onClick={() => handleStartSession(selectedPersona)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white shadow-lg transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Conduct Another Session</span>
          </button>
        </div>

      </div>
    )
  }

  // ─── STAGE 2: ACTIVE 3D CALL INTERFACE ────────────────────────────────────
  const persona = PERSONAS[selectedPersona]
  return (
    <div className="flex-1 flex gap-5 p-5 min-h-0 relative overflow-hidden select-none">
      
      {/* Left Column: 3D Video viewport and controls */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExit}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] flex items-center justify-center text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Live Placement Chamber</span>
              <h1 className="text-xs font-black text-white leading-none mt-0.5">Interview Session with {persona.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Time: <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
            </span>
            <span>
              Q: <span className="text-white font-bold">{currentIndex + 1} / {numQuestions}</span>
            </span>
          </div>
        </div>

        {/* Avatar Viewport */}
        <div className="flex-1 min-h-0 relative">
          <HRAvatar 
            persona={selectedPersona} 
            amplitude={amplitude} 
            isSpeaking={isSpeaking} 
          />

          {/* Quick status cards overlaid */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] font-black text-white uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-fuchsia-400 animate-pulse' : 'bg-gray-500'}`} />
              {persona.name} ({persona.title})
            </span>
            {phase === SESSION_PHASES.ASKING && (
              <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-sm">
                Interviewer Speaking
              </span>
            )}
            {phase === SESSION_PHASES.LISTENING && (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-300 uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-sm">
                Mic Open — Spoken Answer Mode
              </span>
            )}
            {phase === SESSION_PHASES.LOADING_QUESTION && (
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-300 uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-sm animate-pulse">
                Fetching Next Question...
              </span>
            )}
          </div>
        </div>

        {/* Spoken Text Transcription or Type Control */}
        <InterviewControls
          isListening={isListening}
          transcript={transcript}
          interimResult={interimResult}
          micError={micError}
          isSpeechSupported={isSpeechSupported}
          onDoneAnswering={handleDoneAnswering}
          onExit={handleExit}
          manualAnswerText={manualAnswerText}
          setManualAnswerText={setManualAnswerText}
        />

      </div>

      {/* Right Column: AI Criteria & real-time STAR response tracker */}
      <div className="w-80 bg-slate-900/60 rounded-3xl border border-white/[0.08] p-5 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
        
        {/* 1. Category Indicator */}
        <div className="pb-3 border-b border-white/5 space-y-1">
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">Session Topic</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">
              {currentQuestion?.category || 'Behavioral'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[9px] font-black text-gray-400 uppercase tracking-wider border border-white/5">
              {currentQuestion?.difficulty || 'Medium'}
            </span>
          </div>
        </div>

        {/* 2. Real-Time STAR response checker */}
        <div className="space-y-2.5 pb-3 border-b border-white/5">
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">STAR Method Tracker</span>
          <p className="text-[10px] text-gray-500 font-semibold mb-1">Your response structure (evaluates as you type/speak):</p>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-extrabold">
            <div className={`p-2.5 rounded-xl border transition-all duration-300 flex flex-col gap-0.5 ${
              starStatus.s 
                ? 'border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-300' 
                : 'border-white/5 bg-slate-950/40 text-gray-500'
            }`}>
              <span className={`text-xs font-black transition-colors ${starStatus.s ? 'text-cyan-400' : 'text-gray-600'}`}>
                S {starStatus.s ? '✓' : ''}
              </span>
              <span className="text-[8px] uppercase tracking-wider">Situation</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all duration-300 flex flex-col gap-0.5 ${
              starStatus.t 
                ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-emerald-300' 
                : 'border-white/5 bg-slate-950/40 text-gray-500'
            }`}>
              <span className={`text-xs font-black transition-colors ${starStatus.t ? 'text-emerald-400' : 'text-gray-600'}`}>
                T {starStatus.t ? '✓' : ''}
              </span>
              <span className="text-[8px] uppercase tracking-wider">Task</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all duration-300 flex flex-col gap-0.5 ${
              starStatus.a 
                ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.15)] text-amber-300' 
                : 'border-white/5 bg-slate-950/40 text-gray-500'
            }`}>
              <span className={`text-xs font-black transition-colors ${starStatus.a ? 'text-amber-400' : 'text-gray-600'}`}>
                A {starStatus.a ? '✓' : ''}
              </span>
              <span className="text-[8px] uppercase tracking-wider">Action</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all duration-300 flex flex-col gap-0.5 ${
              starStatus.r 
                ? 'border-fuchsia-500/40 bg-fuchsia-950/20 shadow-[0_0_12px_rgba(217,70,239,0.15)] text-fuchsia-300' 
                : 'border-white/5 bg-slate-950/40 text-gray-500'
            }`}>
              <span className={`text-xs font-black transition-colors ${starStatus.r ? 'text-fuchsia-400' : 'text-gray-600'}`}>
                R {starStatus.r ? '✓' : ''}
              </span>
              <span className="text-[8px] uppercase tracking-wider">Result</span>
            </div>
          </div>
        </div>

        {/* 3. Speaking advice */}
        <div className="space-y-2 flex-1 flex flex-col justify-end">
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-2">Speaking Checklist</span>
          <div className="space-y-2 text-[10px] font-bold text-gray-400">
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span>Speech Clarity</span>
              <span className="text-white">Active</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span>Syllable Pacing</span>
              <span className="text-white">120 wpm</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span>Volume Status</span>
              <span className="text-white">Normal</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
