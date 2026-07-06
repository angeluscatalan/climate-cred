'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { LoadingScreen } from '@/components/loading-screen'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface LoadingContextValue {
  /** Call this before navigating to show the loader immediately. */
  startLoading: () => void
}

const LoadingContext = createContext<LoadingContextValue>({
  startLoading: () => {},
})

export function useLoading() {
  return useContext(LoadingContext)
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PageLoadProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  const pathname = usePathname()
  const prevPathname = useRef<string | null>(null)

  // Ref that holds the active safety-timeout handle so it can be cleared.
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ------------------------------------------------------------------
  // Core dismiss sequence: fade out → hide
  // ------------------------------------------------------------------
  const dismiss = useCallback(() => {
    // Clear any pending safety timeout so it doesn't double-fire.
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current)
      safetyTimer.current = null
    }
    setFading(true)
    setTimeout(() => setVisible(false), 500)
  }, [])

  // ------------------------------------------------------------------
  // startLoading — called by nav link onClick handlers
  // ------------------------------------------------------------------
  const startLoading = useCallback(() => {
    // Reset immediately to show the loader.
    setFading(false)
    setVisible(true)

    // 4-second safety timeout: force dismiss if navigation stalls.
    if (safetyTimer.current) clearTimeout(safetyTimer.current)
    safetyTimer.current = setTimeout(dismiss, 4000)
  }, [dismiss])

  // ------------------------------------------------------------------
  // Initial page load: listen for window 'load' event
  // ------------------------------------------------------------------
  useEffect(() => {
    // Record the starting pathname so we don't treat it as a "change".
    prevPathname.current = pathname

    // Safety timeout — never block more than 4 s on first load.
    safetyTimer.current = setTimeout(dismiss, 4000)

    if (document.readyState === 'complete') {
      // Page already loaded by the time React hydrated.
      dismiss()
      return
    }

    const handleLoad = () => dismiss()
    window.addEventListener('load', handleLoad, { once: true })
    return () => window.removeEventListener('load', handleLoad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------
  // Route transitions: dismiss when pathname actually changes
  // ------------------------------------------------------------------
  useEffect(() => {
    // Skip the very first render (prevPathname is null at mount).
    if (prevPathname.current === null) {
      prevPathname.current = pathname
      return
    }
    // Only act on a genuine pathname change.
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      dismiss()
    }
  }, [pathname, dismiss])

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ startLoading }}>
      <LoadingScreen visible={visible} fading={fading} />
      {children}
    </LoadingContext.Provider>
  )
}
