import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getNextQuestion = async (resumeText, qaHistory) => {
  try {
    const response = await client.post('/api/video-interview/next-question', {
      resume_text: resumeText,
      qa_history: qaHistory,
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch next video-interview question:', error)
    throw error
  }
}
