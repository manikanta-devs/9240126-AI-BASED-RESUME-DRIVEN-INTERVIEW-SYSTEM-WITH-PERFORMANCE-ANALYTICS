import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [resumeData, setResumeData] = useState(null)
  const [interviewSession, setInterviewSession] = useState(null)
  const [interviewResults, setInterviewResults] = useState(null)
  const [selectedRole, setSelectedRole] = useState('software_engineer')
  const [difficulty, setDifficulty] = useState('medium')
  const [candidateName, setCandidateName] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  const toggleDark = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem('darkMode', next)
      if (next) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return next
    })
  }, [])

  // Apply dark mode on mount
  React.useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const clearSession = useCallback(() => {
    setInterviewSession(null)
    setInterviewResults(null)
  }, [])

  const value = {
    resumeData, setResumeData,
    interviewSession, setInterviewSession,
    interviewResults, setInterviewResults,
    selectedRole, setSelectedRole,
    difficulty, setDifficulty,
    candidateName, setCandidateName,
    darkMode, toggleDark,
    clearSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
