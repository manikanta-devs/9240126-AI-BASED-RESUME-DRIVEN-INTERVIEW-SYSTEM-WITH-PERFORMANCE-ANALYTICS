import { describe, it, expect, beforeEach } from 'vitest'
import useAppStore from '../store/useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useAppStore.setState({
      resumeData: null,
      interviewSession: null,
      interviewResults: null,
      selectedRole: 'software_engineer',
      difficulty: 'medium',
      candidateName: '',
      darkMode: false,
    })
  })

  it('should have correct initial state', () => {
    const state = useAppStore.getState()
    expect(state.resumeData).toBeNull()
    expect(state.interviewSession).toBeNull()
    expect(state.interviewResults).toBeNull()
    expect(state.selectedRole).toBe('software_engineer')
    expect(state.difficulty).toBe('medium')
    expect(state.candidateName).toBe('')
  })

  it('should set resume data', () => {
    const mockResume = { skills: ['Python', 'React'], name: 'Test User' }
    useAppStore.getState().setResumeData(mockResume)
    expect(useAppStore.getState().resumeData).toEqual(mockResume)
  })

  it('should set interview session', () => {
    const mockSession = { id: '123', role: 'Software Engineer' }
    useAppStore.getState().setInterviewSession(mockSession)
    expect(useAppStore.getState().interviewSession).toEqual(mockSession)
  })

  it('should set interview results', () => {
    const mockResults = { score: 85, grade: 'A' }
    useAppStore.getState().setInterviewResults(mockResults)
    expect(useAppStore.getState().interviewResults).toEqual(mockResults)
  })

  it('should set selected role', () => {
    useAppStore.getState().setSelectedRole('data_scientist')
    expect(useAppStore.getState().selectedRole).toBe('data_scientist')
  })

  it('should set difficulty', () => {
    useAppStore.getState().setDifficulty('hard')
    expect(useAppStore.getState().difficulty).toBe('hard')
  })

  it('should set candidate name', () => {
    useAppStore.getState().setCandidateName('Jane Doe')
    expect(useAppStore.getState().candidateName).toBe('Jane Doe')
  })

  it('should clear session', () => {
    useAppStore.getState().setInterviewSession({ id: '123' })
    useAppStore.getState().setInterviewResults({ score: 85 })
    useAppStore.getState().clearSession()
    expect(useAppStore.getState().interviewSession).toBeNull()
    expect(useAppStore.getState().interviewResults).toBeNull()
  })

  it('should toggle dark mode', () => {
    expect(useAppStore.getState().darkMode).toBe(false)
    useAppStore.getState().toggleDark()
    expect(useAppStore.getState().darkMode).toBe(true)
    useAppStore.getState().toggleDark()
    expect(useAppStore.getState().darkMode).toBe(false)
  })
})
