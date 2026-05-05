import React from 'react'
import { clsx } from 'clsx'

export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  showPercent = true,
  size = 'md',
  color = 'primary',
  animated = true,
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  const getColorByScore = (score) => {
    if (score >= 80) return 'from-emerald-400 to-emerald-500'
    if (score >= 60) return 'from-primary-400 to-primary-600'
    if (score >= 40) return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
  }

  const colorMap = {
    primary:  'from-primary-400 to-primary-600',
    green:    'from-emerald-400 to-emerald-500',
    blue:     'from-blue-400 to-blue-500',
    orange:   'from-orange-400 to-orange-500',
    red:      'from-red-400 to-red-500',
    purple:   'from-violet-400 to-violet-600',
    gradient: 'from-primary-500 via-violet-500 to-cyan-400',
  }

  const barGradient = color === 'auto'
    ? getColorByScore(pct)
    : (colorMap[color] || colorMap.primary)

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercent && (
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden', heights[size])}>
        <div
          className={clsx(
            'rounded-full bg-gradient-to-r relative overflow-hidden',
            barGradient,
            heights[size],
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{ width: `${pct}%` }}
        >
          {/* Shimmer effect on the bar */}
          {pct > 5 && (
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                backgroundSize: '200% 100%',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function CircularProgress({ value = 0, size = 80, strokeWidth = 8, color = '#6366f1', label = '' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const pct = Math.min(100, Math.max(0, value))
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const getColor = (v) => {
    if (v >= 80) return '#22c55e'
    if (v >= 60) return '#6366f1'
    if (v >= 40) return '#f97316'
    return '#ef4444'
  }

  const getGradientId = (v) => {
    if (v >= 80) return 'grad-green'
    if (v >= 60) return 'grad-primary'
    if (v >= 40) return 'grad-orange'
    return 'grad-red'
  }

  const strokeColor = color === 'auto' ? getColor(pct) : color
  const useGradient = color === 'auto'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-white/5"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent"
          stroke={useGradient ? `url(#${getGradientId(pct)})` : strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(pct)}</span>
        {label && <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>}
      </div>
    </div>
  )
}
