import React from 'react'
import { Sparkles, ShieldCheck, Cpu, Video, Zap } from 'lucide-react'

const TICKER_ITEMS = [
  { icon: Sparkles, text: 'TalentForge AI v4.1 Active' },
  { icon: Video, text: '1080p Real HD Video Call Stage Enabled' },
  { icon: ShieldCheck, text: 'Zero-API Key Fallback Protection Active' },
  { icon: Cpu, text: '6 Multi-Provider AI Fallback Chain Online' },
  { icon: Zap, text: 'Real-Time STAR Method Diagnostic Engine' },
]

export default function MarqueeTicker() {
  return (
    <div className="w-full overflow-hidden bg-slate-100 dark:bg-slate-900/90 border-y border-slate-300 dark:border-slate-800/80 py-2.5 px-4 select-none flex items-center shadow-md">
      <div
        className="marquee-track flex items-center gap-8 whitespace-nowrap will-change-transform"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 text-[11px] font-extrabold text-slate-800 dark:text-cyan-300 tracking-wide"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />
              <span>{item.text}</span>
              <span className="text-slate-400 dark:text-slate-600 ml-4">•</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
