import { getTasks } from '@/app/actions'
import { TaskCard } from './task-card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ClipboardList } from 'lucide-react'

export async function TaskList({
  filters,
}: {
  filters?: { status?: string; category?: string; priority?: string }
}) {
  const tasks = await getTasks(filters)

  if (tasks.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <ClipboardList className="h-12 w-12" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No tasks found</EmptyTitle>
          <EmptyDescription>Create a new task to get started</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
