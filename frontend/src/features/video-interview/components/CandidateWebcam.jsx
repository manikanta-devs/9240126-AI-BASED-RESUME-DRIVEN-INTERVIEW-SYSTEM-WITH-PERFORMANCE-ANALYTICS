import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, Video, VideoOff, Mic } from 'lucide-react'

export default function CandidateWebcam({ enabled = true, isSpeaking = false, onToggle = () => {} }) {
  const [cameraReady, setCameraReady] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    if (enabled) {
      setPermissionDenied(false)
      setCameraReady(false)
    }
  }, [enabled])

  const handleUserMedia = useCallback(() => {
    setCameraReady(true)
    setPermissionDenied(false)
  }, [])

  const handleUserMediaError = useCallback(() => {
    setPermissionDenied(true)
    setCameraReady(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 240,
        height: 155,
        borderRadius: 16,
        overflow: 'hidden',
        border: isSpeaking ? '2.5px solid #10b981' : '1.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow: isSpeaking ? '0 0 24px rgba(16,185,129,0.35)' : '0 12px 32px rgba(0, 0, 0, 0.6)',
        background: '#0f172a',
        zIndex: 40,
      }}
    >
      {enabled && !permissionDenied ? (
        <Webcam
          audio={false}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          screenshotFormat="image/jpeg"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror image for natural video call feel
          }}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: 'user',
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: 8 }}>
          <VideoOff style={{ width: 28, height: 28, color: '#f87171' }} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
            {permissionDenied ? 'Camera Blocked' : 'Camera Off'}
          </span>
        </div>
      )}

      {/* Candidate Name Tag Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          padding: '4px 10px',
          borderRadius: 8,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 800, color: '#f8fafc' }}>
          You (Candidate)
        </span>
        {isSpeaking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#34d399', fontSize: 9, fontWeight: 800 }}>
            <Mic style={{ width: 10, height: 10 }} /> LIVE
          </div>
        )}
      </div>
    </motion.div>
  )
}
