import { useEffect } from 'react'

export function useSmoothScroll() {
  useEffect(() => {
    // Enable native smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    let animationFrameId = null
    let currentScroll = window.scrollY
    let targetScroll = window.scrollY

    const handleWheel = (e) => {
      // Gentle inertia smoothing for trackpad and wheel mouse
      if (Math.abs(e.deltaY) > 5) {
        targetScroll += e.deltaY * 0.85
        targetScroll = Math.max(0, Math.min(targetScroll, document.body.scrollHeight - window.innerHeight))
      }
    }

    const smoothScrollLoop = () => {
      currentScroll += (targetScroll - currentScroll) * 0.1
      if (Math.abs(targetScroll - currentScroll) > 0.5) {
        window.scrollTo(0, currentScroll)
      }
      animationFrameId = requestAnimationFrame(smoothScrollLoop)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    animationFrameId = requestAnimationFrame(smoothScrollLoop)

    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
      window.removeEventListener('wheel', handleWheel)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])
}
