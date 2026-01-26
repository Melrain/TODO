'use client'

import { useEffect } from 'react'
import { useTaskStore } from '@/lib/store'
import { useRouter, useSearchParams } from 'next/navigation'

export function ProjectIdSync() {
  const { currentProjectId } = useTaskStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlProjectId = searchParams.get('projectId')
    if (currentProjectId && currentProjectId !== urlProjectId) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('projectId', currentProjectId)
      router.replace(`?${params.toString()}`, { scroll: false })
    } else if (!currentProjectId && urlProjectId) {
      // Sync from URL to store if store is empty
      useTaskStore.getState().setCurrentProjectId(urlProjectId)
    }
  }, [currentProjectId, router, searchParams])

  return null
}
