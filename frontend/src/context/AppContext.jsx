/**
 * Legacy compatibility layer.
 * The real state now lives in the Zustand store (useAppStore).
 * This file re-exports the store through the old useApp() hook
 * so that existing components continue to work without changes.
 */
import React from 'react'
import useAppStore from '../store/useAppStore'

// Thin wrapper provider — children render directly; no Context overhead.
export function AppProvider({ children }) {
  return <>{children}</>
}

// Drop-in replacement for the old useApp() hook.
export function useApp() {
  return useAppStore()
}
