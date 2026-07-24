import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import ResumePage from '../pages/ResumePage'

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}))

describe('ResumePage Component', () => {
  test('renders resume strategy title correctly', () => {
    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Turn a resume into interview strategy/i)).toBeInTheDocument()
  })

  test('renders skill extraction badge', () => {
    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>
    )
    const elements = screen.getAllByText(/Skill extraction/i)
    expect(elements.length).toBeGreaterThan(0)
    expect(elements[0]).toBeInTheDocument()
  })
})
