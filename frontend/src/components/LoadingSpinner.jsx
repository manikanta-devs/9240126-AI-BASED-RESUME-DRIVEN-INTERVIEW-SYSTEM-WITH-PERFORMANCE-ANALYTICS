import React from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', text = '', className = '', color = 'primary' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' }

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div
          className={clsx('rounded-full border-[3px] border-gray-200 dark:border-white/10 animate-spin', sizes[size])}
          style={{ borderTopColor: color === 'white' ? '#fff' : '#6366f1' }}
        />
        <div
          className={clsx('absolute inset-0 rounded-full border-[3px] border-transparent animate-spin', sizes[size])}
          style={{
            borderRightColor: color === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(139,92,246,0.3)',
            animationDirection: 'reverse',
            animationDuration: '1.5s',
          }}
        />
      </div>
      {text && (
        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function FullPageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary-100 dark:border-primary-500/20 border-t-primary-600 dark:border-t-primary-400 animate-spin" />
          <div className="absolute inset-1 rounded-full border-[2px] border-transparent border-b-violet-400/30 animate-spin" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 rounded-full animate-glow" style={{ opacity: 0.3 }} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{text}</p>
      </motion.div>
    </div>
  )
}

export function InlineLoader({ text = 'Please wait...' }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-500/20 border-t-primary-600 dark:border-t-primary-400 animate-spin" />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
    </div>
  )
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div className={clsx('rounded-xl bg-gray-100 dark:bg-white/5 shimmer', className)} />
  )
}
