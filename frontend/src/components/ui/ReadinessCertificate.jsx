import React from 'react'
import { Award, ShieldCheck, Sparkles, CheckCircle2, Star } from 'lucide-react'

export default function ReadinessCertificate({
  candidateName = 'Candidate',
  role = 'Software Engineer',
  overallScore = 88,
  date = new Date().toLocaleDateString(),
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl p-8 bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl text-white space-y-6 overflow-hidden">
        {/* Ambient Corner Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center space-y-2 relative z-10 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Official Certificate of Distinction
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white">
            TalentForge AI Certified
          </h2>
          <p className="text-xs text-slate-400 font-mono">ID: TF-CERT-{Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-4 py-2 relative z-10">
          <p className="text-sm text-slate-300">This is to certify that</p>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-amber-400 underline underline-offset-8 decoration-amber-500/30">
            {candidateName}
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            has successfully completed executive AI-driven technical and behavioral interview evaluations for the position of
          </p>
          <div className="inline-block px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-indigo-300">
            {role}
          </div>

          <div className="pt-4 flex items-center justify-center gap-8">
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-400">{overallScore}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Readiness Index</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <span className="block text-2xl font-black text-amber-400">Distinction</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Evaluation Tier</span>
            </div>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs text-slate-400 relative z-10">
          <div>
            <p className="font-semibold text-slate-200">TalentForge AI Protocol</p>
            <p className="text-[10px] text-slate-500 font-mono">Issued: {date}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
