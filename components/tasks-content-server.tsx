import { Suspense } from 'react'
import { TaskList } from './task-list'
import { TaskStats } from './task-stats'
import { Skeleton } from '@/components/ui/skeleton'

function StatsLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[76px] rounded-lg" />
      ))}
    </div>
  )
}

function TasksLoading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[140px] rounded-lg" />
      ))}
    </div>
  )
}

export function TasksContentServer({
  projectId,
  filters,
}: {
  projectId?: string
  filters?: { status?: string; category?: string; priority?: string }
}) {
  return (
    <>
      <Suspense fallback={<StatsLoading />}>
        <TaskStats projectId={projectId} />
      </Suspense>

      <Suspense fallback={<TasksLoading />}>
        <TaskList filters={filters} projectId={projectId} />
      </Suspense>
    </>
  )
}
