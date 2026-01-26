import { Suspense } from 'react'
import { TaskForm } from '@/components/task-form'
import { TaskFilters } from '@/components/task-filters'
import { TaskList } from '@/components/task-list'
import { TaskStats } from '@/components/task-stats'
import { ThemeToggle } from '@/components/theme-toggle'
import { Code2, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; priority?: string }>
}) {
  const filters = await searchParams
  
  // Get today's date
  const today = new Date()
  const todayFormatted = format(today, 'yyyy年MM月dd日 EEEE', { locale: zhCN })
  
  // App development date (today)
  const appDevDate = format(today, 'yyyy年MM月dd日', { locale: zhCN })

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/10">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 shadow-sm">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Dev Tasks
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {todayFormatted}
                  </span>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <p>Track bugs, features, and everything in between</p>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-xs">开发日期: {appDevDate}</span>
          </div>
        </header>

        <Suspense fallback={<StatsLoading />}>
          <TaskStats />
        </Suspense>

        <div className="flex flex-col gap-4 mt-8 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <Suspense fallback={null}>
            <TaskFilters />
          </Suspense>
          <TaskForm />
        </div>

        <Suspense fallback={<TasksLoading />}>
          <TaskList filters={filters} />
        </Suspense>
      </div>
    </main>
  )
}

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
