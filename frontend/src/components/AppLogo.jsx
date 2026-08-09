import React from 'react'
import { motion } from 'framer-motion'

export default function AppLogo({ size = 38, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <motion.div
        className="relative overflow-hidden rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 shrink-0"
        style={{ width: size, height: size }}
        aria-hidden="true"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.3),transparent_50%),linear-gradient(315deg,rgba(6,182,212,0.3),transparent_50%)]" />
        <svg viewBox="0 0 64 64" width={size} height={size} className="absolute inset-0">
          <path
            d="M16 18H48M32 18V46"
            fill="none"
            stroke="url(#brandT)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 28H44"
            fill="none"
            stroke="url(#brandF)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="18" r="3" fill="#a78bfa" />
          <circle cx="48" cy="18" r="3" fill="#22d3ee" />
          <circle cx="44" cy="28" r="2.5" fill="#34d399" />
          <circle cx="32" cy="46" r="3" fill="#60a5fa" />
          <defs>
            <linearGradient id="brandT" x1="16" y1="18" x2="32" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="brandF" x1="32" y1="28" x2="44" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
            TalentForge<span className="text-indigo-600 dark:text-cyan-400 font-extrabold">.AI</span>
          </div>
          <div className="text-[10px] font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase mt-0.5 leading-none">
            Placement & AI Coach
          </div>
        </div>
      )}
    </div>
  )
}
