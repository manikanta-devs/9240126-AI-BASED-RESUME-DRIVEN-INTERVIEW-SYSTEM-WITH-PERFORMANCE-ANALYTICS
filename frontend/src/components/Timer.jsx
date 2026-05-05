import React, { useState, useEffect, useRef } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

export default function Timer({ durationSeconds = 120, onExpire, running = true, className = '' }) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(durationSeconds)
  }, [durationSeconds])

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const pct = (remaining / durationSeconds) * 100
  const isWarning = pct < 30
  const isCritical = pct < 10

  // SVG circular progress
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const strokeColor = isCritical ? '#ef4444' : isWarning ? '#f97316' : '#6366f1'
  const bgColor = isCritical
    ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
    : isWarning
    ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'
    : 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20'

  const textColor = isCritical
    ? 'text-red-700 dark:text-red-300'
    : isWarning
    ? 'text-orange-700 dark:text-orange-300'
    : 'text-primary-700 dark:text-primary-300'

  return (
    <div className={clsx(
      'inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl font-mono font-semibold text-sm transition-all duration-500 border',
      bgColor,
      isCritical && 'animate-pulse',
      className
    )}>
      <div className="relative flex items-center justify-center" style={{ width: 40, height: 40 }}>
        <svg width={40} height={40} className="-rotate-90">
          <circle
            cx={20} cy={20} r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={3}
            className="text-gray-200 dark:text-white/10"
          />
          <circle
            cx={20} cy={20} r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={3}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isCritical
            ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: strokeColor }} />
            : <Clock className="w-3.5 h-3.5" style={{ color: strokeColor }} />
          }
        </div>
      </div>
      <span className={textColor}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

export function ElapsedTimer({ className = '' }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className={clsx(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 font-mono text-sm',
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
