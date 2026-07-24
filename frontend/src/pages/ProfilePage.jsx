import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, GraduationCap, Award, Shield, Save, CheckCircle2, Trophy, Flame, Star, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { GlassPanel, SpotlightCard, ShimmerButton, GradientText } from '../components/ui'
import { FullPageLoader } from '../components/LoadingSpinner'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    phone: '',
    college: '',
    bio: '',
    avatar_url: '',
    created_at: ''
  })

  const username = localStorage.getItem('username') || 'Candidate'
  const token = localStorage.getItem('token') || ''

  useEffect(() => {
    // Fetch user profile from API
    axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data?.profile) {
          setProfile(res.data.profile)
        }
      })
      .catch(() => {
        // Fallback profile if backend isn't returning data
        setProfile(prev => ({ ...prev, username }))
      })
      .finally(() => setLoading(false))
  }, [token, username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put('/api/auth/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <FullPageLoader text="Loading candidate profile..." />
  }

  const achievements = [
    { icon: Trophy, title: 'First Mock Completed', desc: 'Completed your first AI mock interview', unlocked: true, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { icon: Flame, title: 'Interview Streak', desc: 'Practiced 3 days in a row', unlocked: true, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { icon: Star, title: 'STAR Method Master', desc: 'Achieved > 85% in STAR score breakdown', unlocked: true, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { icon: Sparkles, title: 'ATS Optimized', desc: 'Uploaded and parsed resume with high keyword match', unlocked: true, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ]

  return (
    <div className="space-y-8 text-slate-100 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <GlassPanel className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white ring-4 ring-slate-900 shadow-xl">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : username.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 text-center md:text-left">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              {profile.full_name || username}
            </h1>
            <p className="text-sm text-indigo-400 font-mono">@{profile.username || username}</p>
            <p className="text-xs text-slate-400 max-w-md">
              {profile.bio || 'Candidate preparing for AI-assisted technical and behavioral interviews.'}
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="font-display text-lg font-bold text-white">Candidate Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="e.g. Manikanta Dev"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  placeholder="e.g. Department of Computer Applications"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Bio & Target Roles
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Brief summary of your target role and tech stack..."
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <ShimmerButton
                type="submit"
                disabled={saving}
                className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </ShimmerButton>
            </form>
          </GlassPanel>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-6">
          <GlassPanel className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-white">Achievements</h2>
            </div>

            <div className="space-y-3">
              {achievements.map((ach, idx) => {
                const Icon = ach.icon
                return (
                  <SpotlightCard key={idx} className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${ach.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                        <p className="text-[11px] text-slate-400">{ach.desc}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                )
              })}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
