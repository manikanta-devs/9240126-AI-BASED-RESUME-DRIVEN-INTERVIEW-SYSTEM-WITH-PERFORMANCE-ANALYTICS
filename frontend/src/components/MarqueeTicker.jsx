import React from 'react'
import { Sparkles, ShieldCheck, Cpu, Video, Zap } from 'lucide-react'

const TICKER_ITEMS = [
  { icon: Sparkles, text: 'TalentForge AI v4.1 Active', color: '#a78bfa' },
  { icon: Video, text: '1080p Real HD Video Call Stage Enabled', color: '#34d399' },
  { icon: ShieldCheck, text: 'Zero-API Key Fallback Protection Active', color: '#60a5fa' },
  { icon: Cpu, text: '6 Multi-Provider AI Fallback Chain Online', color: '#fbbf24' },
  { icon: Zap, text: 'Real-Time STAR Method Diagnostic Engine', color: '#f87171' },
]

export default function MarqueeTicker() {
  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(16,185,129,0.1) 50%, rgba(59,130,246,0.1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 0',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {/* Render twice for seamless looping */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#e2e8f0',
                letterSpacing: '0.04em',
              }}
            >
              <Icon style={{ width: 14, height: 14, color: item.color }} />
              <span>{item.text}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: '16px' }}>•</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
