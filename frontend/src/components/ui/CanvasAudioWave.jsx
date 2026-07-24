import React, { useEffect, useRef } from 'react'

export default function CanvasAudioWave({ audioStream, isRecording, className = "w-full h-12" }) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)

  useEffect(() => {
    if (!isRecording || !audioStream) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(audioStream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const canvas = canvasRef.current
      if (!canvas) return
      const canvasCtx = canvas.getContext('2d')

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 1.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85

          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0)
          gradient.addColorStop(0, '#6366f1')
          gradient.addColorStop(0.5, '#a855f7')
          gradient.addColorStop(1, '#ec4899')

          canvasCtx.fillStyle = gradient
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight)

          x += barWidth + 1
        }
      }

      draw()
    } catch (e) {
      // Graceful fallback if Web Audio API not supported
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [audioStream, isRecording])

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={48}
      className={`rounded-lg opacity-90 transition-opacity ${className}`}
    />
  )
}
