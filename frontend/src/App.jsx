import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import { FullPageLoader } from './components/LoadingSpinner'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'))
const CommunicationCoachPage = lazy(() => import('./pages/CommunicationCoachPage'))
const ResumePage = lazy(() => import('./pages/ResumePage'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SystemDesignPage = lazy(() => import('./pages/SystemDesignPage'))
import ProtectedRoute from './components/ProtectedRoute'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="coach" element={<CommunicationCoachPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="interview" element={<InterviewPage />} />
            <Route path="video-interview" element={<Navigate to="/dashboard/interview" replace />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="system-design" element={<SystemDesignPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="results/:sessionId" element={<ResultsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '14px',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif'
            }
          }}
        />
        <Suspense fallback={<FullPageLoader text="Loading TalentForge AI..." />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}
