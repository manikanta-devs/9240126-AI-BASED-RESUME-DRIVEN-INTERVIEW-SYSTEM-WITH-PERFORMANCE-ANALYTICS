import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react'

export default function STARCoachOverlay({ text = '', className = '' }) {
  const analysis = useMemo(() => {
    const lower = text.toLowerCase()
    
    // Heuristic detection patterns
    const hasSituation = /(when|at|during|project|team|company|faced|encountered|client|time)/.test(lower)
    const hasTask = /(goal|task|objective|responsible|needed to|had to|target|problem|requirement)/.test(lower)
    const hasAction = /(i built|i designed|i created|i implemented|i led|i refactored|i managed|i developed|i resolved|i orchestrated)/.test(lower)
    const hasResult = /(%|percent|increased|decreased|improved|reduced|saved|result|outcome|achieved|faster|ms|seconds)/.test(lower)

    const count = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length
    const score = Math.round((count / 4) * 100)

    return {
      situation: hasSituation,
      task: hasTask,
      action: hasAction,
      result: hasResult,
      count,
      score
    }
  }, [text])

  const items = [
    { key: 'situation', label: 'Situation', desc: 'Context & Background', active: analysis.situation },
    { key: 'task', label: 'Task', desc: 'Goal / Challenge', active: analysis.task },
    { key: 'action', label: 'Action', desc: 'Personal Role ("I built...")', active: analysis.action },
    { key: 'result', label: 'Result', desc: 'Quantified Impact (%, WPM, ms)', active: analysis.result },
  ]

  return (
    <motion.div
      className={`p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-md text-white space-y-2.5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time STAR Coach</span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
          analysis.score >= 75 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
          analysis.score >= 50 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
          'bg-slate-800 text-slate-400'
        }`}>
          {analysis.score}% Structure
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(({ key, label, desc, active }) => (
          <div
            key={key}
            className={`p-2 rounded-lg border text-left transition-all ${
              active
                ? 'border-indigo-500/30 bg-indigo-500/10 text-white'
                : 'border-slate-800/60 bg-slate-900/30 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>{label}</span>
              {active ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border border-slate-700" />
              )}
            </div>
            <p className="text-[9px] text-slate-400 truncate mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
