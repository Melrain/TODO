import { getTasks } from '@/lib/actions'
import { TaskCard } from './task-card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ClipboardList } from 'lucide-react'

export async function TaskList({
  filters,
  projectId,
}: {
  filters?: { status?: string; category?: string; priority?: string }
  projectId?: string
}) {
  const tasks = await getTasks({ ...filters, projectId })

  if (tasks.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <ClipboardList className="h-12 w-12" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>暂无任务</EmptyTitle>
          <EmptyDescription>创建新任务开始使用</EmptyDescription>
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
