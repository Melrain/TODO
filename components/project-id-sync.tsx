'use client'

import { useEffect, useRef } from 'react'
import { useTaskStore } from '@/lib/store'
import { useRouter, useSearchParams } from 'next/navigation'

export function ProjectIdSync() {
  const { currentProjectId } = useTaskStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isUpdatingRef = useRef(false)
  const lastSyncedProjectIdRef = useRef<string | null>(null)
  const urlProjectId = searchParams.get('projectId')

  // Sync from URL to store (only once on mount or when URL changes)
  useEffect(() => {
    if (urlProjectId && urlProjectId !== lastSyncedProjectIdRef.current && urlProjectId !== currentProjectId) {
      lastSyncedProjectIdRef.current = urlProjectId
      useTaskStore.getState().setCurrentProjectId(urlProjectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProjectId])

  // Sync from store to URL (when store changes)
  useEffect(() => {
    // Prevent infinite loops
    if (isUpdatingRef.current) return
    if (!currentProjectId) return
    if (currentProjectId === urlProjectId) return
    if (currentProjectId === lastSyncedProjectIdRef.current) return

    isUpdatingRef.current = true
    lastSyncedProjectIdRef.current = currentProjectId
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('projectId', currentProjectId)
    router.replace(`?${params.toString()}`, { scroll: false })
    
    // Reset flag after navigation
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId])

  return null
}
