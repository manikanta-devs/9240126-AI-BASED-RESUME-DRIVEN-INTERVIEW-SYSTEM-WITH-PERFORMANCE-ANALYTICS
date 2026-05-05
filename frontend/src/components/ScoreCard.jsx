import React from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { CircularProgress } from './ProgressBar'

const gradeConfig = {
  'A+': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', label: 'Outstanding' },
  'A':  { color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-50 dark:bg-green-500/10',     border: 'border-green-200 dark:border-green-500/20',     label: 'Excellent'    },
  'B+': { color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-500/10',       border: 'border-blue-200 dark:border-blue-500/20',       label: 'Very Good'    },
  'B':  { color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-500/10', border: 'border-primary-200 dark:border-primary-500/20', label: 'Good'         },
  'C+': { color: 'text-orange-600 dark:text-orange-400',   bg: 'bg-orange-50 dark:bg-orange-500/10',   border: 'border-orange-200 dark:border-orange-500/20',   label: 'Fair'         },
  'C':  { color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-500/10',         border: 'border-red-200 dark:border-red-500/20',         label: 'Needs Work'   },
}

export function GradeBadge({ grade = 'B', className = '' }) {
  const cfg = gradeConfig[grade] || gradeConfig['B']
  return (
    <motion.div
      className={clsx(
        'inline-flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 font-bold',
        cfg.bg, cfg.border, className
      )}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className={clsx('text-3xl font-black', cfg.color)}>{grade}</span>
      <span className={clsx('text-[10px] font-semibold', cfg.color)}>{cfg.label}</span>
    </motion.div>
  )
}

export function ScoreCard({ title, score, icon, description, color = 'auto', className = '' }) {
  return (
    <motion.div
      className={clsx('card flex items-center gap-4 hover-lift', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CircularProgress value={score} size={72} strokeWidth={7} color={color} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
        )}
        <div className="mt-2">
          <ScoreLabel score={score} />
        </div>
      </div>
    </motion.div>
  )
}

export function ScoreLabel({ score }) {
  if (score >= 80) return <span className="badge badge-green">Excellent</span>
  if (score >= 65) return <span className="badge badge-blue">Good</span>
  if (score >= 50) return <span className="badge badge-orange">Average</span>
  return <span className="badge badge-red">Needs Improvement</span>
}

export function MiniScoreRow({ label, score, className = '' }) {
  const getColor = (s) => {
    if (s >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (s >= 60) return 'text-primary-600 dark:text-primary-400'
    if (s >= 40) return 'text-orange-500 dark:text-orange-400'
    return 'text-red-500 dark:text-red-400'
  }

  const getBar = (s) => {
    if (s >= 80) return 'from-emerald-400 to-emerald-500'
    if (s >= 60) return 'from-primary-400 to-primary-600'
    if (s >= 40) return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
  }

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <span className="text-sm text-gray-600 dark:text-gray-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700', getBar(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={clsx('text-sm font-bold w-8 text-right', getColor(score))}>{score}</span>
    </div>
  )
}
