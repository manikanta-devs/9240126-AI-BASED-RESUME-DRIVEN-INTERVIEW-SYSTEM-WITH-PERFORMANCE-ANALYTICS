import React from 'react'
import { motion } from 'framer-motion'

export default function AppLogo({ size = 40, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="relative overflow-hidden rounded-[1.15rem] shadow-2xl shadow-violet-500/20 ring-1 ring-white/10"
        style={{ width: size, height: size }}
        aria-hidden="true"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-0 bg-[#070b19]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.22),transparent_40%),linear-gradient(315deg,rgba(6,182,212,0.2),transparent_42%)]" />
        <div className="absolute inset-x-2 top-2 h-px bg-white/30" />
        <svg viewBox="0 0 64 64" width={size} height={size} className="absolute inset-0">
          <rect x="0" y="0" width="64" height="64" rx="18" fill="none" />
          {/* Futuristic Interlocking T-F Geometric Shield */}
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
          <circle cx="16" cy="18" r="2.5" fill="#a78bfa" />
          <circle cx="48" cy="18" r="2.5" fill="#22d3ee" />
          <circle cx="44" cy="28" r="2" fill="#34d399" />
          <circle cx="32" cy="46" r="2.5" fill="#60a5fa" />
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
        <div className="min-w-0">
          <div className="font-black leading-tight text-sm brand-text tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
            TalentForge
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 leading-tight">
            Placement & AI Coach
          </div>
        </div>
      )}
    </div>
  )
}
