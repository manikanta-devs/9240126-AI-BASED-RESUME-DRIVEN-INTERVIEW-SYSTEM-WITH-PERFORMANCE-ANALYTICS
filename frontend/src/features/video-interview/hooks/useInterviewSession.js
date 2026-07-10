import { useState, useEffect } from 'react'
import { getNextQuestion } from '../api/videoInterviewApi'
import { useApp } from '../../../context/AppContext'

export const SESSION_PHASES = {
  IDLE: 'idle',
  LOADING_QUESTION: 'loading_question',
  ASKING: 'asking',
  LISTENING: 'listening',
  EVALUATING: 'evaluating',
  COMPLETE: 'complete'
}

export function useInterviewSession(numQuestions = 5) {
  const [phase, setPhase] = useState(SESSION_PHASES.IDLE)
  const [qaHistory, setQaHistory] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // Extract user's resume text from global app context
  const { resumeText } = useApp()

  // Session timer
  useEffect(() => {
    let timer = null
    if (phase !== SESSION_PHASES.IDLE && phase !== SESSION_PHASES.COMPLETE) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [phase])

  const startInterview = async () => {
    setPhase(SESSION_PHASES.LOADING_QUESTION)
    setQaHistory([])
    setCurrentIndex(0)
    setElapsedTime(0)
    setCurrentQuestion(null)

    await fetchNextQuestion([])
  }

  const fetchNextQuestion = async (history) => {
    try {
      setPhase(SESSION_PHASES.LOADING_QUESTION)
      // Call backend next question API with resume text + current history
      const qData = await getNextQuestion(resumeText || '', history)
      
      setCurrentQuestion(qData)
      setPhase(SESSION_PHASES.ASKING)
    } catch (e) {
      console.error('Failed to retrieve next question, using hardcoded fallback:', e)
      // Fallback: Local questions list
      const fallbackQuestions = [
        { question: "To start off, could you please introduce yourself and tell me a bit about your professional background?", category: "Introduction", difficulty: "Easy" },
        { question: "Describe a complex technical challenge you faced and how you overcame it.", category: "Technical", difficulty: "Medium" },
        { question: "Tell me about a time you had a difference of opinion with a team member. How did you resolve it?", category: "Behavioral", difficulty: "Hard" },
        { question: "Why do you want to join our organization, and what makes you the ideal candidate for this role?", category: "Behavioral", difficulty: "Medium" },
        { question: "What are your career goals for the next three years, and how do you plan to achieve them?", category: "Behavioral", difficulty: "Easy" }
      ]
      
      const qIdx = history.length % fallbackQuestions.length
      setCurrentQuestion(fallbackQuestions[qIdx])
      setPhase(SESSION_PHASES.ASKING)
    }
  }

  const submitAnswer = async (answerText) => {
    setPhase(SESSION_PHASES.EVALUATING)
    
    // Add Q&A pair to history
    const updatedHistory = [
      ...qaHistory,
      {
        question: currentQuestion.question,
        answer: answerText || '(No verbal answer recorded)',
        category: currentQuestion.category || 'General',
        difficulty: currentQuestion.difficulty || 'Medium'
      }
    ]
    setQaHistory(updatedHistory)

    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)

    if (nextIndex >= numQuestions) {
      setPhase(SESSION_PHASES.COMPLETE)
    } else {
      await fetchNextQuestion(updatedHistory)
    }
  }

  const resetInterview = () => {
    setPhase(SESSION_PHASES.IDLE)
    setQaHistory([])
    setCurrentQuestion(null)
    setCurrentIndex(0)
    setElapsedTime(0)
  }

  return {
    phase,
    setPhase,
    qaHistory,
    currentQuestion,
    currentIndex,
    elapsedTime,
    startInterview,
    submitAnswer,
    resetInterview
  }
}
