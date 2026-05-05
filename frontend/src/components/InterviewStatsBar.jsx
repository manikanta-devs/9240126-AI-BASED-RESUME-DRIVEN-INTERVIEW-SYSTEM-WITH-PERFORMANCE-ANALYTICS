import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Mic, Video, Type, BarChart3, Zap } from 'lucide-react'
import { formatSeconds } from '../utils/voiceInterview'
import { getDifficultyLabel } from '../utils/adaptiveEngine'

export default function InterviewStatsBar({
  currentIndex = 0,
  totalQuestions = 0,
  elapsedSeconds = 0,
  totalElapsed = 0,
  interviewFormat = 'voice',
  difficulty = 'medium',
  progress = 0,
}) {
  const diffLabel = getDifficultyLabel(difficulty)
  const modeIcons = { text: Type, voice: Mic, video: Video }
  const ModeIcon = modeIcons[interviewFormat] || Mic

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/[0.06] backdrop-blur-sm"
    >
      {/* Question counter */}
      <StatChip label="Question" value={`${currentIndex + 1} / ${totalQuestions}`} icon={<BarChart3 className="w-3.5 h-3.5 text-cyan-400" />} />

      <Divider />

      {/* Time left */}
      <StatChip label="Time Left" value={formatSeconds(Math.max(0, 120 - elapsedSeconds))} icon={<Clock className="w-3.5 h-3.5 text-cyan-400" />} />

      <Divider />

      {/* Total time */}
      <StatChip label="Total Time" value={formatSeconds(totalElapsed)} icon={<Clock className="w-3.5 h-3.5 text-gray-500" />} />

      <Divider />

      {/* Mode */}
      <StatChip label="Mode" value={interviewFormat.charAt(0).toUpperCase() + interviewFormat.slice(1)} icon={<ModeIcon className="w-3.5 h-3.5 text-violet-400" />} />

      <Divider />

      {/* Difficulty */}
      <div className="flex items-center gap-2 px-3">
        <Zap className={`w-3.5 h-3.5 ${diffLabel.color}`} />
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-none">Difficulty</p>
          <p className={`text-xs font-bold ${diffLabel.color}`}>{diffLabel.label}</p>
        </div>
      </div>

      <Divider />

      {/* Progress bar */}
      <div className="flex-1 min-w-[80px] px-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Progress</p>
          <p className="text-[10px] font-bold text-white">{Math.round(progress)}%</p>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function StatChip({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 px-3">
      {icon}
      <div>
        <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-xs font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-8 bg-white/[0.06]" />
}
