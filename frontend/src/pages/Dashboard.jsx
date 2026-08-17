import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const PAGE_META = {
  '/dashboard/resume':        { title: 'Resume Analysis',     subtitle: 'Upload and analyze your resume with spaCy NLP' },
  '/dashboard/interview':     { title: 'Mock Interview',      subtitle: 'Practice technical & behavioral questions with AI Feedback' },
  '/dashboard/coach':         { title: 'Communication Coach', subtitle: 'Train clarity, STAR structure, and interview speaking skills' },
  '/dashboard/quiz':          { title: 'Quiz Practice',       subtitle: 'Strengthen technical knowledge with CS quizzes' },
  '/dashboard/system-design': { title: 'System Design Studio', subtitle: 'Solve distributed systems architecture problems & receive Staff Engineer feedback' },
  '/dashboard/analytics':     { title: 'Performance Analytics', subtitle: 'Track your progress, skill breakdown, and readiness trends' },
  '/dashboard/profile':       { title: 'Candidate Profile',   subtitle: 'Manage candidate details, institution, and achievement badges' },
  '/dashboard':               { title: 'Dashboard Overview', subtitle: 'Live performance snapshot and preparation control center' },
}

const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  in:       { opacity: 1, y: 0 },
  out:      { opacity: 0, y: -8 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

export default function Dashboard() {
  const location = useLocation()
  
  // Find exact matching route or deepest prefix matching route
  const meta = PAGE_META[location.pathname] || 
    Object.entries(PAGE_META).find(([path]) => location.pathname.startsWith(path) && path !== '/dashboard')?.[1] || 
    PAGE_META['/dashboard']

  React.useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTop = 0
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#070b13] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <motion.div
            key={location.pathname}
            className="max-w-7xl mx-auto"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
