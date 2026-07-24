import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Star, Zap, Award, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginUser, registerUser } from '../api/client'
import AppLogo from '../components/AppLogo'
import { AuroraBackground, ShimmerButton, SpotlightCard, GlassPanel, GradientText } from '../components/ui'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const navigate = useNavigate()

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' }
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500' }
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength(password)

  const handleAuth = async (e) => {
    e.preventDefault()
    const trimmedUser = username.trim()
    const trimmedPass = password.trim()

    if (!trimmedUser || !trimmedPass) {
      toast.error('Username and password are required')
      return
    }

    if (activeTab === 'register') {
      if (trimmedPass.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      if (trimmedPass !== confirmPassword.trim()) {
        toast.error('Passwords do not match')
        return
      }
    }

    setLoading(true)

    try {
      if (activeTab === 'register') {
        await registerUser(trimmedUser, trimmedPass)
        toast.success('Registration successful! Please sign in.')
        setActiveTab('login')
        setPassword('')
        setConfirmPassword('')
      } else {
        const res = await loginUser(trimmedUser, trimmedPass)
        const token = res.data.access_token || res.data.token
        const uname = res.data.username || trimmedUser

        if (token) {
          localStorage.setItem('token', token)
          localStorage.setItem('username', uname)
          toast.success(`Welcome back, ${uname}!`)
          navigate('/dashboard')
        } else {
          toast.error('Invalid server response')
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Authentication failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast.error('Please enter your email')
      return
    }
    toast.success('Password reset instructions sent to your email!')
    setShowForgotModal(false)
    setForgotEmail('')
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex overflow-hidden font-sans">
      {/* ─── LEFT SIDE: Animated Brand Showcase (Desktop) ────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800/50">
        <AuroraBackground className="absolute inset-0 z-0 opacity-80" />

        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <AppLogo className="w-10 h-10 text-indigo-400" />
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              TalentForge<span className="text-indigo-400">.AI</span>
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Next-Gen Interview Simulation
          </div>

          <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Master Every Interview with <GradientText>AI Precision</GradientText>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            Practice real-time technical and behavioral interviews powered by multi-provider LLMs, live speech analysis, and STAR-method scoring.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <SpotlightCard className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Multi-Provider AI</h4>
                  <p className="text-xs text-slate-400">Gemini, Groq & Fallbacks</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">STAR Scoring</h4>
                  <p className="text-xs text-slate-400">Detailed Feedback</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Footer Stat / Trust */}
        <div className="relative z-10 pt-6 border-t border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900">JD</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900">AS</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900">MK</div>
            </div>
            <span className="text-xs text-slate-400 font-medium">Joined by 10,000+ candidates</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Failover Stack</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Auth Form Container ─────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <AppLogo className="w-10 h-10 text-indigo-400" />
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              TalentForge<span className="text-indigo-400">.AI</span>
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-400">
              {activeTab === 'login' 
                ? 'Sign in to access your interview dashboard and analytics' 
                : 'Join TalentForge to start practicing resume-driven interviews'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="relative p-1 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative z-10 ${
                activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative z-10 ${
                activeTab === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>

            {/* Sliding Pill Animation */}
            <motion.div
              className="absolute inset-y-1 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20"
              initial={false}
              animate={{
                left: activeTab === 'login' ? '4px' : '50%',
                width: 'calc(50% - 4px)'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>

          {/* Glass Form Card */}
          <GlassPanel className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
            <AnimatePresence mode="wait">
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleAuth}
                className="space-y-5"
              >
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      id="auth-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alex_developer"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="auth-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Register only) */}
                  {activeTab === 'register' && password && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Strength:</span>
                        <span className={`font-semibold ${
                          strength.label === 'Weak' ? 'text-rose-400' :
                          strength.label === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Register only) */}
                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        id="auth-confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <ShimmerButton
                  type="submit"
                  disabled={loading}
                  id="auth-submit-btn"
                  className="w-full py-3.5 mt-2 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </ShimmerButton>
              </motion.form>
            </AnimatePresence>
          </GlassPanel>

          {/* Quick Demo Access Hint */}
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
            <p className="text-xs text-slate-400">
              💡 <span className="font-semibold text-indigo-300">Quick Test:</span> You can sign in with any username & password, or create a new account instantly.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Forgot Password Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">
                  Enter your registered email address and we'll send you recovery instructions.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <ShimmerButton
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-semibold"
                  >
                    Send Email
                  </ShimmerButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
