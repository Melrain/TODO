'use client'

import { useEffect, useState } from 'react'
import { TaskFilters } from './task-filters'
import { TaskForm } from './task-form'
import { useTaskStore } from '@/lib/store'
import { useSearchParams } from 'next/navigation'

export function TasksContent() {
  const { currentProjectId } = useTaskStore()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 mt-8 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <TaskFilters />
      <TaskForm />
    </div>
  )
}
