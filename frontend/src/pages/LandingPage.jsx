import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowRight, CheckCircle, XCircle, Brain,
  Mic, BarChart2, FileText, Shield, Zap, Target, Star,
  ChevronRight, Activity
} from 'lucide-react'
import { checkHealth } from '../api/client'
import AppLogo from '../components/AppLogo'
import LoadingSpinner from '../components/LoadingSpinner'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const FEATURES = [
  { icon: Brain,     title: 'AI-Powered Questions',     desc: 'Gemini 2.0 Flash generates role-specific, context-aware interview questions from your resume.',     color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Mic,       title: 'Voice & Video Interviews',  desc: 'Practice with live speech recognition, filler-word detection, and real-time confidence scoring.',    color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  { icon: BarChart2, title: 'Deep Analytics',            desc: 'Track score trends, weak areas, skill breakdowns, and get a personalized weekly study plan.',       color: 'text-primary-400',bg: 'bg-primary-500/10' },
  { icon: FileText,  title: 'Resume Intelligence',      desc: 'Upload your resume for NLP-powered parsing, skill extraction, and job-match scoring.',              color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
  { icon: Target,    title: 'Quiz Practice',             desc: 'Strengthen weak topics with MCQ drills across coding, Python, SQL, aptitude, and HR prep.',         color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Shield,    title: 'Communication Coach',      desc: 'AI-generated speaking drills, daily practice tracks, and structured coaching for interview clarity.',color: 'text-fuchsia-400',bg: 'bg-fuchsia-500/10' },
]

const STATS = [
  { label: 'AI Models',    value: 'Gemini 2.0' },
  { label: 'Interview Modes', value: '3 Formats' },
  { label: 'Quiz Topics',  value: '5+' },
  { label: 'Analytics',    value: 'Real-time' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')
  const [version, setVersion] = useState('')

  useEffect(() => {
    checkHealth()
      .then(({ data }) => {
        setStatus('connected')
        setVersion(data.version || '3.0.0')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/4 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Navigation */}
      <motion.nav
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AppLogo size={36} showText={true} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
            style={{
              borderColor: status === 'connected' ? 'rgba(34,197,94,0.3)' : status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
              background: status === 'connected' ? 'rgba(34,197,94,0.08)' : status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
            }}
          >
            {status === 'checking' && <LoadingSpinner size="sm" color="white" />}
            {status === 'connected' && <><Activity className="w-3.5 h-3.5 text-green-400" /> <span className="text-green-300">API Live</span></>}
            {status === 'error' && <><XCircle className="w-3.5 h-3.5 text-red-400" /> <span className="text-red-300">Offline</span></>}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-sm"
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Powered by Google Gemini 2.0 Flash
            <span className="px-2 py-0.5 rounded-md bg-primary-500/15 text-primary-300 text-xs font-semibold ml-1">v{version || '3.0'}</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6">
            Ace your next interview
            <br />
            <span className="gradient-text">with AI coaching</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            Practice with AI-generated questions tailored to your resume, get instant feedback on answers,
            and track your improvement with deep analytics.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center mb-16">
            <button onClick={() => navigate('/dashboard/interview')} className="btn-primary px-8 py-3.5 text-base">
              <Sparkles className="w-5 h-5" /> Start AI Interview
            </button>
            <button onClick={() => navigate('/dashboard/resume')} className="btn-secondary px-8 py-3.5 text-base bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20">
              <FileText className="w-5 h-5" /> Upload Resume
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 backdrop-blur-sm">
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs text-white/40 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3">Everything you need to prepare</h2>
          <p className="text-white/40 max-w-xl mx-auto">Six integrated modules that work together to build your interview readiness.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-primary-600/20 via-violet-600/10 to-cyan-600/10 border border-white/[0.06] p-12 md:p-16 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to start practicing?</h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Upload your resume, start a mock interview, and get AI-powered feedback in minutes. No signup required.
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary px-10 py-4 text-base">
              Open Dashboard <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-white/30">
          <div className="flex items-center gap-2">
            <AppLogo size={20} showText={false} />
            <span>AI Interview Coach — Built with Gemini AI</span>
          </div>
          <span>{version && `v${version}`}</span>
        </div>
      </footer>
    </div>
  )
}
