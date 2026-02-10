import { getTasks } from '@/lib/actions'
import { TaskStatsClient } from './task-stats-client'

export async function TaskStats({ projectId }: { projectId?: string }) {
  const tasks = await getTasks({ projectId })
  
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return <TaskStatsClient stats={stats} />
}
