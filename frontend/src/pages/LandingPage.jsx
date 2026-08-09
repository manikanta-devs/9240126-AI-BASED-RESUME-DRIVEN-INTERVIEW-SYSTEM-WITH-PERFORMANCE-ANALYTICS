import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Brain, Mic,
  BarChart2, FileText, Shield, Target, ChevronRight,
  Sparkles, Cpu, Video, Award
} from 'lucide-react'
import { checkHealth } from '../api/client'
import AppLogo from '../components/AppLogo'
import {
  AuroraBackground, GridPattern, SpotlightCard, GlassPanel,
  ShimmerButton, GradientText
} from '../components/ui'

const FEATURES = [
  { icon: Cpu, title: 'Multi-Provider AI Engine', desc: '6-Layer Fallback Routing across Mistral, Gemini 2.5 Flash, DeepSeek, Groq Llama, OpenRouter & HuggingFace for zero-downtime availability.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Target, title: 'STAR Method Diagnostic Evaluator', desc: 'Real-time Situation, Task, Action, and Result scoring engine calibrated against enterprise engineering expectations.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: FileText, title: 'spaCy NLP ATS Resume Scanner', desc: 'Extracts technical skills, audits keyword correlation against job posts, and generates targeted study roadmaps.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Video, title: '1080p Real HD Video Stage', desc: 'Widescreen 16:9 interviewer stage featuring Nagma HR & Sarah Chen, live CC subtitles, and floating glass toolbar.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Mic, title: 'Communication & Speech Coach', desc: 'Measures WPM speaking pace, tracks filler word count (um/like), and evaluates voice delivery clarity.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: BarChart2, title: 'Readiness Performance Analytics', desc: 'Multi-format Radar vectors, weakness diagnostic trends, and downloadable PDF performance evaluation reports.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState('4.1.0')
  const [healthStatus, setHealthStatus] = useState('ok')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    checkHealth()
      .then(res => {
        if (res.data?.version) setVersion(res.data.version)
        setHealthStatus('ok')
      })
      .catch(() => setHealthStatus('demo'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-between pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <AuroraBackground className="absolute inset-0 z-0 opacity-70" />
        <GridPattern className="z-0 opacity-25" numSquares={25} />

        {/* Top Navigation Bar */}
        <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-4">
          <AppLogo size={42} showText={true} />

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <ShimmerButton
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 text-xs font-bold"
              >
                Go to Dashboard
              </ShimmerButton>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-4 py-2 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <ShimmerButton
                  onClick={() => navigate('/auth')}
                  className="px-5 py-2.5 text-xs font-bold"
                >
                  Get Started
                </ShimmerButton>
              </>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center my-auto py-12 space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/40 text-cyan-300 text-xs font-bold shadow-xl backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI-Driven Resume & Interview Coaching Platform</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Ace Your Next Tech Interview with <GradientText>AI Realism</GradientText>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Upload your resume, get custom AI-generated questions, practice voice responses, and receive real-time STAR evaluation.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {isLoggedIn ? (
              <>
                <ShimmerButton
                  onClick={() => navigate('/dashboard/interview')}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold flex items-center justify-center gap-2"
                >
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </ShimmerButton>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
                >
                  Open Dashboard
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <ShimmerButton
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold flex items-center justify-center gap-2"
                >
                  Start Free Mock Interview
                  <ArrowRight className="w-5 h-5" />
                </ShimmerButton>

                <button
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
                >
                  Explore Features
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Real Architectural Feature Cards (No Fake Metrics) */}
        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
          <GlassPanel className="p-5 rounded-2xl border border-indigo-500/30 bg-slate-900/90 text-left space-y-2 shadow-xl">
            <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 6 AI Providers
            </div>
            <div className="text-sm font-bold text-white leading-tight">Multi-Provider Fallback</div>
            <div className="text-[11px] text-slate-300 font-medium">Mistral, Gemini, DeepSeek, Groq, OpenRouter & HF</div>
          </GlassPanel>

          <GlassPanel className="p-5 rounded-2xl border border-indigo-500/30 bg-slate-900/90 text-left space-y-2 shadow-xl">
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Target className="w-4 h-4" /> STAR Framework
            </div>
            <div className="text-sm font-bold text-white leading-tight">Diagnostic Evaluator</div>
            <div className="text-[11px] text-slate-300 font-medium">Situation, Task, Action & Result scoring</div>
          </GlassPanel>

          <GlassPanel className="p-5 rounded-2xl border border-indigo-500/30 bg-slate-900/90 text-left space-y-2 shadow-xl">
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> spaCy NLP
            </div>
            <div className="text-sm font-bold text-white leading-tight">ATS Resume Matcher</div>
            <div className="text-[11px] text-slate-300 font-medium">Keyword overlap & gap correlation audit</div>
          </GlassPanel>

          <GlassPanel className="p-5 rounded-2xl border border-indigo-500/30 bg-slate-900/90 text-left space-y-2 shadow-xl">
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Video className="w-4 h-4" /> 1080p HD Stage
            </div>
            <div className="text-sm font-bold text-white leading-tight">Video Interview Room</div>
            <div className="text-[11px] text-slate-300 font-medium">Nagma HR avatar, CC subtitles & floating bar</div>
          </GlassPanel>
        </div>
      </section>

      {/* ─── Features Grid ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Platform Architecture
          </h2>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to Ace Tech Interviews
          </p>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            From ATS resume skill extraction to live voice interview coaching — powered by multi-provider autonomous AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <SpotlightCard key={idx} className="p-6 rounded-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-md space-y-4 shadow-xl">
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">{feat.desc}</p>
              </SpotlightCard>
            )
          })}
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 py-12 px-4 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size={24} showText={true} />
          </div>
          <p className="font-medium">© {new Date().getFullYear()} TalentForge AI Platform. Built for engineering & career excellence.</p>
        </div>
      </footer>
    </div>
  )
}
