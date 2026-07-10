import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function HRAvatar({ persona = 'sarah', amplitude = 0, isSpeaking = false }) {
  const containerRef = useRef(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Three.js instances
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const animationFrameIdRef = useRef(null)
  const faceMeshesRef = useRef([])
  const mixerRef = useRef(null)

  const isMale = persona === 'marcus'
  const modelUrl = isMale ? '/interviewers/male.glb' : '/interviewers/female.glb'
  const imageUrl = isMale ? '/interviewers/marcus_rodriguez.png' : '/interviewers/sarah_chen.png'

  useEffect(() => {
    // We start the Three.js setup
    if (!containerRef.current) return

    setLoading(true)
    setLoadError(false)
    faceMeshesRef.current = []

    // 1. Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = null // Transparent so tailwind gradients show through

    // 2. Camera setup
    const width = containerRef.current.clientWidth || 320
    const height = containerRef.current.clientHeight || 320
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 1.25) // zoom in close on upper torso / face
    cameraRef.current = camera

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const spotLight = new THREE.DirectionalLight(0xffffff, 1.5)
    spotLight.position.set(2, 4, 3)
    scene.add(spotLight)

    // Add a glowing rim light from behind the avatar for premium depth
    const rimLight = new THREE.DirectionalLight(isMale ? 0x0ea5e9 : 0xa855f7, 2.0)
    rimLight.position.set(-2, 2, -2)
    scene.add(rimLight)

    // 5. Load GLTF Avatar
    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene
        
        // Position avatar to focus on head/shoulders
        model.position.set(0, -1.45, 0) 
        model.scale.set(1.0, 1.0, 1.0)
        scene.add(model)

        // Find facial meshes containing ARKit / Oculus morph target shapes
        model.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary) {
            faceMeshesRef.current.push(child)
          }
        })

        // Set up idle animations if animations exist in GLTF
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model)
          mixerRef.current = mixer
          // Play first animation (usually idle or T-pose, we play idle if present)
          const action = mixer.clipAction(gltf.animations[0])
          action.play()
        }

        setLoading(false)
      },
      undefined,
      (error) => {
        console.warn(`Three.js failed to load GLB model ${modelUrl}. Falling back to 2D dynamic vector view.`, error)
        setLoadError(true)
        setLoading(false)
        cleanupThree()
      }
    )

    // 6. Animation Render Loop
    let clock = new THREE.Clock()
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate)

      const time = clock.getElapsedTime()
      const delta = clock.getDelta()

      // Idle movement: subtle breathing and head swaying
      if (sceneRef.current) {
        sceneRef.current.traverse((child) => {
          // Subtle breathing / chest motion
          if (child.name === 'Spine' || child.name === 'Spine1') {
            child.rotation.z = Math.sin(time * 1.5) * 0.01
            child.rotation.x = Math.sin(time * 0.8) * 0.015
          }
          // Subtle head swaying
          if (child.name === 'Neck' || child.name === 'Head') {
            child.rotation.y = Math.sin(time * 0.6) * 0.03
            child.rotation.z = Math.cos(time * 0.8) * 0.01
          }
        })
      }

      // Update animation mixer if present
      if (mixerRef.current) {
        mixerRef.current.update(delta)
      }

      // Live lip sync: update mouth Open and jawOpen morph targets based on amplitude
      if (faceMeshesRef.current.length > 0) {
        faceMeshesRef.current.forEach((mesh) => {
          const morphDict = mesh.morphTargetDictionary
          const morphInfluences = mesh.morphTargetInfluences
          
          if (!morphDict || !morphInfluences) return

          // RPM avatars expose 'jawOpen' / 'mouthOpen'
          const jawIdx = morphDict['jawOpen']
          const mouthIdx = morphDict['mouthOpen']

          if (jawIdx !== undefined) {
            // Lerp jaw value for smooth natural movement
            morphInfluences[jawIdx] = THREE.MathUtils.lerp(morphInfluences[jawIdx], amplitude, 0.45)
          }
          if (mouthIdx !== undefined) {
            morphInfluences[mouthIdx] = THREE.MathUtils.lerp(morphInfluences[mouthIdx], amplitude * 0.5, 0.45)
          }

          // Dynamic Blinking (blink every 4 seconds)
          const eyeBlinkLeft = morphDict['eyeBlinkLeft'] || morphDict['eyeBlink_L']
          const eyeBlinkRight = morphDict['eyeBlinkRight'] || morphDict['eyeBlink_R']
          
          if (eyeBlinkLeft !== undefined && eyeBlinkRight !== undefined) {
            const blinkCycle = time % 4.0
            if (blinkCycle > 3.85 && blinkCycle < 3.98) {
              morphInfluences[eyeBlinkLeft] = 1.0
              morphInfluences[eyeBlinkRight] = 1.0
            } else {
              morphInfluences[eyeBlinkLeft] = THREE.MathUtils.lerp(morphInfluences[eyeBlinkLeft], 0, 0.3)
              morphInfluences[eyeBlinkRight] = THREE.MathUtils.lerp(morphInfluences[eyeBlinkRight], 0, 0.3)
            }
          }
        })
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    // 7. Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup functions
    const cleanupThree = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
      window.removeEventListener('resize', handleResize)
      
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement)
        } catch (e) {}
      }

      // Dispose geometries & materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }

      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
    }

    return cleanupThree
  }, [modelUrl])

  // Render static 2D vector fallback UI if Three.js load fails
  if (loadError) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-slate-950 overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl select-none group">
        {/* Animated background glow */}
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 transition-all duration-700 ${isSpeaking ? 'opacity-80' : 'opacity-100'}`} />
        
        {/* Pulsing ring aura behind portrait */}
        <div 
          className={`absolute rounded-full border transition-all duration-300 ${
            isSpeaking ? 'scale-110 opacity-70' : 'scale-100 opacity-20'
          } ${
            isMale 
              ? 'border-cyan-500/40 bg-cyan-950/10 shadow-[0_0_50px_rgba(6,182,212,0.15)]' 
              : 'border-fuchsia-500/40 bg-fuchsia-950/10 shadow-[0_0_50px_rgba(217,70,239,0.15)]'
          }`}
          style={{
            width: `${180 + amplitude * 120}px`,
            height: `${180 + amplitude * 120}px`,
          }}
        />

        {/* Inner glow ring */}
        <div 
          className={`absolute rounded-full border transition-all duration-200 ${
            isSpeaking ? 'scale-105 opacity-80' : 'scale-100 opacity-10'
          } ${
            isMale ? 'border-cyan-400/60' : 'border-fuchsia-400/60'
          }`}
          style={{
            width: `${160 + amplitude * 70}px`,
            height: `${160 + amplitude * 70}px`,
          }}
        />

        {/* Portrait container */}
        <div className={`relative z-10 w-36 h-36 rounded-full overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
          isSpeaking 
            ? isMale ? 'border-cyan-400 scale-102 ring-4 ring-cyan-500/20' : 'border-fuchsia-400 scale-102 ring-4 ring-fuchsia-500/20'
            : 'border-white/15'
        }`}>
          <img 
            src={imageUrl} 
            alt={persona} 
            className="w-full h-full object-cover select-none scale-105 group-hover:scale-110 transition-transform duration-700" 
          />
        </div>

        {/* Subtitles Overlay */}
        {isSpeaking && (
          <div className="absolute bottom-6 left-6 right-6 z-20 text-center select-text">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/5 text-[10px] font-bold text-gray-300 inline-flex items-center gap-1.5 backdrop-blur-sm">
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isMale ? 'bg-cyan-400' : 'bg-fuchsia-400'}`} />
              Active Speech Synthesis Audio Channel
            </span>
          </div>
        )}

        {/* Dynamic visualizer wave pattern overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-40 z-10 flex items-end justify-center gap-0.5 px-10 pb-2">
          {Array.from({ length: 24 }).map((_, idx) => {
            const seed = Math.sin(idx * 0.5) * Math.cos(idx * 0.2)
            const heightVal = isSpeaking ? (amplitude * 45 * Math.abs(seed) + Math.random() * 8) : (3 + Math.sin(idx * 0.3) * 2)
            return (
              <div 
                key={idx}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isMale ? 'bg-cyan-500/60' : 'bg-fuchsia-500/60'
                }`}
                style={{ height: `${Math.max(2, heightVal)}px` }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-950 shadow-2xl flex items-center justify-center">
      {/* Three.js canvas container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
          <div className="relative w-12 h-12">
            <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${
              isMale ? 'border-cyan-500' : 'border-fuchsia-500'
            }`} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Loading 3D HR Avatar...
          </span>
        </div>
      )}

      {/* Speaking border glow */}
      {isSpeaking && (
        <div className={`absolute inset-0 z-15 pointer-events-none rounded-3xl border-2 transition-all duration-300 ${
          isMale 
            ? 'border-cyan-500/30 shadow-[inset_0_0_30px_rgba(6,182,212,0.1)]' 
            : 'border-fuchsia-500/30 shadow-[inset_0_0_30px_rgba(217,70,239,0.1)]'
        }`} />
      )}
    </div>
  )
}
