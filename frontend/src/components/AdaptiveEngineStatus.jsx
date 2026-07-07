import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Zap, Volume2, Shield, RefreshCw } from 'lucide-react'

export default function AdaptiveEngineStatus() {
  const [latency] = useState(null)
  const [activeProvider, setActiveProvider] = useState('Auto provider chain')
  const [engineLoad] = useState(0)
  const [persona, setPersona] = useState('Tech Lead')
  const [pacingWpm, setPacingWpm] = useState(140)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#050d18_0%,#091321_50%,#0b2326_100%)] p-6 text-white shadow-2xl"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,rgba(99,102,241,0.12),transparent_40%),linear-gradient(300deg,rgba(20,184,166,0.1),transparent_40%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide text-white">AI Interview Engine Status</h3>
              <p className="text-xs text-white/50">Provider routing, interviewer persona, and local speech settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Engine Active</span>
          </div>
        </div>

        {/* Diagnostic Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Latency & Routing Card */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Dynamic Router</span>
              <Zap className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-200">{latency ? `${latency} ms` : 'Ready'}</div>
              <div className="text-[11px] font-semibold text-white/70 mt-1">Active: <span className="text-indigo-300 font-bold">{activeProvider}</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-2">
              <span>Failover chain: Active</span>
              <button 
                onClick={() => setActiveProvider(prev => prev === 'Auto provider chain' ? 'Local fallback ready' : 'Auto provider chain')}
                className="hover:text-indigo-300 transition-colors flex items-center gap-1 font-bold"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Cycle Provider
              </button>
            </div>
          </div>

          {/* Active AI Persona */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Interviewer Persona</span>
              <Shield className="h-4 w-4 text-teal-300" />
            </div>
            <div>
              <div className="text-2xl font-black text-teal-300">{persona}</div>
              <div className="text-[11px] font-semibold text-white/70 mt-1">Tone: <span className="text-white/90">Strict, feedback-heavy, adaptive</span></div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-white/5 pt-2">
              {['Tech Lead', 'HR Coach', 'Recruiter'].map(p => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                    persona === p ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Local Audio Diagnostic */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Local Speech Telemetry</span>
              <Volume2 className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-300">{pacingWpm} <span className="text-xs font-medium text-white/50">WPM</span></div>
              <div className="text-[11px] font-semibold text-white/70 mt-1">Pacing Status: <span className="text-emerald-300 font-bold">Optimal Speed</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-2">
              <span>Filler word limit: &lt;5%</span>
              <div className="flex gap-1.5">
                <button onClick={() => setPacingWpm(110)} className="hover:text-white">Slow</button>
                <span>|</span>
                <button onClick={() => setPacingWpm(140)} className="hover:text-white">Normal</button>
                <span>|</span>
                <button onClick={() => setPacingWpm(175)} className="hover:text-white">Fast</button>
              </div>
            </div>
          </div>

        </div>

        {/* Engine Performance & Adaptive Engine Chart Slider */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="font-bold uppercase tracking-wider">Session Load</span>
              <span>{engineLoad}% active</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="bg-indigo-400 h-1.5 rounded-full" 
                animate={{ width: `${engineLoad}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-white/40">Updates from active interview sessions when available</span>
          </div>

          <div className="flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="font-bold uppercase tracking-wider">Adaptive Difficulty Range</span>
              <span className="text-teal-300 font-bold">Auto-Scaling</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/55">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/10">Easy</span>
              <span className="h-0.5 flex-grow mx-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 opacity-60"></span>
              <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold border border-red-500/10">Hard</span>
            </div>
            <span className="text-[10px] text-white/40">Adjusts next question category based on score trajectory</span>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
