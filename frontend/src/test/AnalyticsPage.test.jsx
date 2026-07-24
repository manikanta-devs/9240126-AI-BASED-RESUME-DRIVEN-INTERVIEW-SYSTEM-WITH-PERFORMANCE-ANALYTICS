import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import AnalyticsPage from '../pages/AnalyticsPage'

// Mock api client
vi.mock('../api/client', () => ({
  getAnalyticsSummary: vi.fn().mockResolvedValue({ data: { summary: { total_sessions: 0 } } }),
  getAnalyticsSessions: vi.fn().mockResolvedValue({ data: { sessions: [] } }),
  getPerformanceTrend: vi.fn().mockResolvedValue({ data: { trend: [] } }),
  getWeakAreas: vi.fn().mockResolvedValue({ data: { weak_areas: [] } }),
  getSkillBreakdown: vi.fn().mockResolvedValue({ data: { breakdown: [] } }),
  getStudyPlan: vi.fn().mockResolvedValue({ data: { study_plan: [] } }),
  getQuizSessions: vi.fn().mockResolvedValue({ data: { sessions: [] } }),
}))

describe('AnalyticsPage Component', () => {
  test('renders Performance Intelligence Node header', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Performance Intelligence Node/i)).toBeInTheDocument()
  })
})
