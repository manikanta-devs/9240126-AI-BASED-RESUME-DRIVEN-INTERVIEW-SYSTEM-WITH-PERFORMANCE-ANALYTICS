import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Persona Data ────────────────────────────────────────────────────────────

const PERSONAS = {
  sarah: {
    name: 'Sarah Chen',
    title: 'Senior HR Director',
    company: 'TalentForge AI',
    image: '/interviewers/sarah_chen.png',
    accentColor: 'from-blue-500 to-indigo-600',
    ringColor: 'ring-blue-500/40',
  },
  marcus: {
    name: 'Marcus Rodriguez',
    title: 'Technical Lead',
    company: 'TalentForge AI',
    image: '/interviewers/marcus_rodriguez.png',
    accentColor: 'from-teal-500 to-emerald-600',
    ringColor: 'ring-teal-500/40',
  },
};

// ─── State Theme Map ─────────────────────────────────────────────────────────

const STATE_THEMES = {
  idle: {
    label: 'Online',
    dotColor: 'bg-gray-400',
    borderGradient: 'from-white/10 via-white/5 to-white/10',
    orbColors: 'from-slate-700/30 via-slate-800/20 to-slate-900/10',
    glowShadow: '0 0 40px rgba(148,163,184,0.08)',
    pulseRing: false,
  },
  speaking: {
    label: 'Speaking...',
    dotColor: 'bg-cyan-400',
    borderGradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    orbColors: 'from-cyan-500/25 via-blue-600/20 to-indigo-600/15',
    glowShadow: '0 0 60px rgba(34,211,238,0.25), 0 0 120px rgba(99,102,241,0.12)',
    pulseRing: true,
  },
  listening: {
    label: 'Listening',
    dotColor: 'bg-green-400',
    borderGradient: 'from-green-400 via-emerald-500 to-green-400',
    orbColors: 'from-green-500/25 via-emerald-600/20 to-green-700/15',
    glowShadow: '0 0 60px rgba(74,222,128,0.22), 0 0 100px rgba(16,185,129,0.10)',
    pulseRing: true,
  },
  thinking: {
    label: 'Thinking...',
    dotColor: 'bg-amber-400',
    borderGradient: 'from-amber-400 via-yellow-500 to-orange-400',
    orbColors: 'from-amber-500/25 via-yellow-600/20 to-orange-600/15',
    glowShadow: '0 0 60px rgba(251,191,36,0.22), 0 0 100px rgba(245,158,11,0.10)',
    pulseRing: true,
  },
  evaluating: {
    label: 'Evaluating...',
    dotColor: 'bg-violet-400',
    borderGradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
    orbColors: 'from-violet-500/25 via-purple-600/20 to-fuchsia-600/15',
    glowShadow: '0 0 60px rgba(167,139,250,0.25), 0 0 100px rgba(192,132,252,0.12)',
    pulseRing: true,
  },
  impressed: {
    label: 'Impressed!',
    dotColor: 'bg-green-400',
    borderGradient: 'from-green-400 via-emerald-400 to-teal-400',
    orbColors: 'from-green-400/30 via-emerald-500/25 to-teal-500/20',
    glowShadow: '0 0 80px rgba(74,222,128,0.35), 0 0 140px rgba(52,211,153,0.18)',
    pulseRing: true,
  },
};

// ─── Waveform Bar Component ──────────────────────────────────────────────────

function WaveformBar({ index, accentColor }) {
  const minHeight = 4;
  const maxHeight = 24;
  const duration = 0.3 + Math.random() * 0.3;
  const delay = index * 0.05;

  return (
    <motion.div
      className={`w-1 rounded-full bg-gradient-to-t ${accentColor}`}
      initial={{ height: minHeight }}
      animate={{
        height: [
          minHeight + Math.random() * (maxHeight - minHeight),
          minHeight + Math.random() * (maxHeight - minHeight) * 0.4,
          minHeight + Math.random() * (maxHeight - minHeight),
          minHeight + Math.random() * (maxHeight - minHeight) * 0.6,
          minHeight + Math.random() * (maxHeight - minHeight),
        ],
      }}
      transition={{
        duration: duration * 2,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
        delay,
      }}
      style={{ opacity: 0.85 }}
    />
  );
}

// ─── Waveform Visualizer ─────────────────────────────────────────────────────

function WaveformVisualizer({ accentColor }) {
  const barCount = 9;

  return (
    <motion.div
      className="flex items-end justify-center gap-[3px] h-7"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <WaveformBar key={i} index={i} accentColor={accentColor} />
      ))}
    </motion.div>
  );
}

// ─── Animated Status Dot ─────────────────────────────────────────────────────

function StatusDot({ color, pulse }) {
  return (
    <span className="relative flex h-2 w-2">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${color}`}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

// ─── Gradient Border Wrapper ─────────────────────────────────────────────────

function GradientBorder({ gradient, glow, pulse, children }) {
  return (
    <div className="relative rounded-2xl" style={{ perspective: '1000px' }}>
      {/* Animated gradient border layer */}
      <motion.div
        className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-br ${gradient} z-0`}
        animate={
          pulse
            ? { opacity: [0.7, 1, 0.7] }
            : { opacity: 0.4 }
        }
        transition={
          pulse
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.6 }
        }
        style={{ boxShadow: glow, filter: 'blur(0.5px)' }}
      />
      {/* Secondary outer ring glow for active states */}
      {pulse && (
        <motion.div
          className={`absolute -inset-[6px] rounded-[18px] bg-gradient-to-br ${gradient} z-0`}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(8px)' }}
        />
      )}
      <div className="relative z-10 rounded-2xl overflow-hidden bg-gray-950">
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RealisticInterviewer({
  persona = 'sarah',
  state = 'idle',
  isSpeaking = false,
  showWaveform = true,
  className = '',
}) {
  const personaData = PERSONAS[persona] || PERSONAS.sarah;
  const theme = STATE_THEMES[state] || STATE_THEMES.idle;

  // Derive the 3D rotation based on state
  const rotateVariants = useMemo(() => {
    switch (state) {
      case 'speaking':
        return {
          rotateY: [-1.5, 1.5, -1.5],
          y: [0, -4, 0],
          transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'listening':
        return {
          rotateY: 1.5,
          y: [0, -2, 0],
          transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'thinking':
        return {
          rotateY: [-2, 0, -2],
          y: [0, -2, 0],
          transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'evaluating':
        return {
          rotateY: [0, 2, 0],
          y: [0, -2, 0],
          transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'impressed':
        return {
          rotateY: 0,
          y: [0, -5, 0],
          scale: [1, 1.012, 1],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        };
      default:
        return {
          rotateY: 0,
          y: [0, -3, 0],
          transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        };
    }
  }, [state]);

  // Ambient orb animation
  const orbAnimate = useMemo(() => {
    const isActive = state !== 'idle';
    return {
      scale: isActive ? [1, 1.1, 1] : [1, 1.04, 1],
      opacity: isActive ? [0.5, 0.7, 0.5] : [0.3, 0.4, 0.3],
    };
  }, [state]);

  return (
    <div className={`flex flex-col items-center gap-3 select-none ${className}`}>
      {/* ── Portrait Container ──────────────────────────────────── */}
      <div className="relative w-full max-w-[460px]">
        {/* Ambient Background Orb */}
        <motion.div
          className={`absolute inset-0 -inset-x-8 -inset-y-6 rounded-[40px] bg-gradient-to-br ${theme.orbColors} blur-3xl z-0 pointer-events-none`}
          animate={orbAnimate}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Portrait with Gradient Border */}
        <div className="relative z-10">
          <GradientBorder
            gradient={theme.borderGradient}
            glow={theme.glowShadow}
            pulse={theme.pulseRing}
          >
            {/* Portrait Image */}
            <motion.div
              className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900"
              animate={rotateVariants}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 office-room-bg" />
              <div className="absolute left-5 top-5 h-14 w-24 rounded-sm border border-white/10 bg-white/[0.03] shadow-inner" />
              <div className="absolute right-6 top-7 h-24 w-16 rounded-sm border border-white/10 bg-slate-200/10" />
              <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-slate-950/95 via-slate-900/55 to-transparent" />

              <img
                src={personaData.image}
                alt={personaData.name}
                className="relative z-10 h-full w-full object-cover object-[center_24%] saturate-[0.95] contrast-[1.04]"
                draggable={false}
              />

              <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(90deg,rgba(2,6,23,0.35),transparent_22%,transparent_78%,rgba(2,6,23,0.32)),radial-gradient(circle_at_50%_18%,transparent_42%,rgba(2,6,23,0.42)_100%)]" />
              <div className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full bg-slate-950/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live Office
              </div>

              {/* Bottom fade for badge readability */}
              <div className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-gray-950/85 via-gray-950/35 to-transparent pointer-events-none" />

              {/* ── Status Badge (overlaid on portrait bottom) ──── */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state}
                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.92 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-black/50 border border-white/10 shadow-lg"
                  >
                    <StatusDot
                      color={theme.dotColor}
                      pulse={state !== 'idle'}
                    />
                    <span className="text-[11px] font-medium tracking-wide text-white/90">
                      {theme.label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </GradientBorder>
        </div>
      </div>

      {/* ── Sound Waveform ──────────────────────────────────────── */}
      <div className="h-7 flex items-center justify-center">
        <AnimatePresence>
          {isSpeaking && showWaveform && (
            <WaveformVisualizer accentColor={personaData.accentColor} />
          )}
        </AnimatePresence>
      </div>

      {/* ── Name Card ───────────────────────────────────────────── */}
      <div className="w-full max-w-[460px]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.06] shadow-lg">
          {/* Small avatar thumbnail */}
          <div className="relative flex-shrink-0">
            <img
              src={personaData.image}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
              draggable={false}
            />
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-gray-950 bg-green-400" />
          </div>

          {/* Info */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-white truncate leading-tight">
              {personaData.name}
            </span>
            <span className="text-[11px] text-white/45 truncate leading-tight mt-0.5">
              {personaData.title}
            </span>
          </div>

          {/* Company pill */}
          <div className="ml-auto flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r ${personaData.accentColor} text-white shadow-md`}
            >
              {personaData.company}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
