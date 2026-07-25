import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function MagneticCard({ children, className = '', style = {}, onClick = () => {} }) {
  const cardRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = (e.clientX - centerX) * 0.1
    const distanceY = (e.clientY - centerY) * 0.1
    setPosition({ x: distanceX, y: distanceY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.1 }}
      style={{
        position: 'relative',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: isHovered ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isHovered ? '0 12px 32px rgba(139, 92, 246, 0.2)' : '0 4px 16px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        transition: 'border 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {/* Shimmer Border Glow Layer */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.12), transparent 40%)',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </motion.div>
  )
}
