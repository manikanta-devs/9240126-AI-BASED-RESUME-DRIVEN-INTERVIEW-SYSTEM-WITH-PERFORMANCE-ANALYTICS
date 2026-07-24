import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, XCircle, Brain, Mic,
  BarChart2, FileText, Shield, Zap, Target, ChevronRight,
  Activity, MessageSquare, Gauge, Layers, Play, Sparkles, Award, Users, Star
} from 'lucide-react'
import { checkHealth } from '../api/client'
import AppLogo from '../components/AppLogo'
import {
  AuroraBackground, GridPattern, SpotlightCard, GlassPanel,
  ShimmerButton, NumberTicker, GradientText, TextReveal, AnimatedList
} from '../components/ui'

const FEATURES = [
  { icon: Brain, title: 'Adaptive AI Interviews', desc: 'Gemini & Groq powered questions shift dynamically by role, resume context, difficulty, and response quality.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Mic, title: 'Speaking & Pacing Sandbox', desc: 'Speak aloud to measure WPM pacing, detect filler words (um/like), and analyze tone in real time.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: FileText, title: 'Resume ATS Heatmap', desc: 'Map your resume against ATS parsers, score section strength, and get AI-suggested bullet improvements.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: BarChart2, title: 'Readiness Analytics', desc: 'Track competence radar maps, STAR score progression, and personalized weekly study roadmaps.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Shield, title: 'Zero-Downtime Fallback', desc: 'Multi-provider routing layer seamlessly shifts between 7 AI models if one experiences rate limits.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Target, title: 'Job Description Matcher', desc: 'Paste any job post to audit keyword match gaps, skill overlap, and custom interview scenarios.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState('3.1.0')
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
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* ─── Hero Section with Aurora & Grid Pattern ─────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-between pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/50">
        <AuroraBackground className="absolute inset-0 z-0 opacity-70" />
        <GridPattern className="z-0 opacity-30" numSquares={25} />

        {/* Top Navigation Bar */}
        <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <AppLogo className="w-9 h-9 text-indigo-400" />
            <span className="font-display font-bold text-xl tracking-tight text-white">
              TalentForge<span className="text-indigo-400">.AI</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              v{version}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <ShimmerButton
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-semibold"
              >
                Go to Dashboard
              </ShimmerButton>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </button>
                <ShimmerButton
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 text-xs font-semibold"
                >
                  Get Started Free
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
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
            className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
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
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold flex items-center justify-center gap-2"
                >
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </ShimmerButton>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  Open Dashboard
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <ShimmerButton
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold flex items-center justify-center gap-2"
                >
                  Start Free Mock Interview
                  <ArrowRight className="w-5 h-5" />
                </ShimmerButton>

                <button
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  Explore Features
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Live Metrics Strip */}
        <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          <GlassPanel className="p-4 rounded-xl text-center">
            <div className="text-2xl font-bold font-display text-white">
              <NumberTicker value={10000} suffix="+" />
            </div>
            <div className="text-xs text-slate-400 mt-1">Interviews Conducted</div>
          </GlassPanel>

          <GlassPanel className="p-4 rounded-xl text-center">
            <div className="text-2xl font-bold font-display text-indigo-400">
              <NumberTicker value={98} suffix="%" />
            </div>
            <div className="text-xs text-slate-400 mt-1">STAR Score Accuracy</div>
          </GlassPanel>

          <GlassPanel className="p-4 rounded-xl text-center">
            <div className="text-2xl font-bold font-display text-emerald-400">
              <NumberTicker value={200} prefix="< " suffix="ms" />
            </div>
            <div className="text-xs text-slate-400 mt-1">AI Response Latency</div>
          </GlassPanel>

          <GlassPanel className="p-4 rounded-xl text-center">
            <div className="text-2xl font-bold font-display text-purple-400">
              <NumberTicker value={7} suffix=" Models" />
            </div>
            <div className="text-xs text-slate-400 mt-1">Multi-Provider Fallback</div>
          </GlassPanel>
        </div>
      </section>

      {/* ─── Features Grid ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            Platform Capabilities
          </h2>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to Get Hired
          </p>
          <p className="text-slate-400 text-sm sm:text-base">
            From ATS resume optimization to live voice interview coaching — powered by autonomous multi-model AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <SpotlightCard key={idx} className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-4">
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </SpotlightCard>
            )
          })}
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/50 py-12 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AppLogo className="w-5 h-5 text-indigo-400" />
            <span className="font-display font-semibold text-slate-300">TalentForge AI Platform</span>
          </div>
          <p>© {new Date().getFullYear()} TalentForge AI. All rights reserved. Built for career excellence.</p>
        </div>
      </footer>
    </div>
  )
}
