import React from 'react'
import { motion } from 'framer-motion'

export default function AppLogo({ size = 40, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="relative overflow-hidden rounded-[1.55rem] shadow-2xl shadow-primary-500/20 ring-1 ring-white/10"
        style={{ width: size, height: size }}
        aria-hidden="true"
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-0 bg-[#0b1023]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(35,214,255,0.15),transparent_26%),radial-gradient(circle_at_85%_78%,rgba(183,74,255,0.15),transparent_24%)]" />
        <div className="absolute inset-0 animate-glow rounded-[1.55rem]" style={{ opacity: 0.3 }} />
        <svg viewBox="0 0 64 64" width={size} height={size} className="absolute inset-0">
          <rect x="0" y="0" width="64" height="64" rx="22" fill="none" />
          <path
            d="M14 46L31.5 19.5C32.2 18.4 33.8 18.4 34.5 19.5L50 46"
            fill="none"
            stroke="url(#brandA)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 44L32 27L42.8 44"
            fill="none"
            stroke="#0b1023"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 35.5H35"
            fill="none"
            stroke="#0b1023"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M46 21L49 18L52 21L49 24Z" fill="#3ddcff" />
          <path d="M52.5 27.5L55 25L57.5 27.5L55 30Z" fill="#63a7ff" />
          <path d="M47 28.5L49 26.5L51 28.5L49 30.5Z" fill="#7a4dff" />
          <path d="M44.5 34.5L46 33L47.5 34.5L46 36Z" fill="#b04dff" />
          <path d="M43 25.5L44.5 24L46 25.5L44.5 27Z" fill="#2dc8ff" />
          <path d="M36.5 44.5L39 42L41.5 44.5L39 47Z" fill="#a96bff" />
          <path d="M29.8 45.5L32 43.3L34.2 45.5L32 47.7Z" fill="#f0f5ff" />
          <path d="M31.8 41L33.7 39.1L35.6 41L33.7 42.9Z" fill="#35d7ff" opacity="0.9" />
          <defs>
            <linearGradient id="brandA" x1="14" y1="18" x2="50" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#28e7ff" />
              <stop offset="48%" stopColor="#1978ff" />
              <stop offset="100%" stopColor="#b94cff" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {showText && (
        <div className="min-w-0">
          <div className="font-black leading-tight text-sm gradient-text">
            AI Interview Coach
          </div>
          <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 leading-tight">
            Interview Prep Platform
          </div>
        </div>
      )}
    </div>
  )
}