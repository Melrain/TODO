import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ProjectTabs } from '@/components/project-tabs'
import { TasksContent } from '@/components/tasks-content'
import { TasksContentServer } from '@/components/tasks-content-server'
import { ProjectIdSync } from '@/components/project-id-sync'
import { Code2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; priority?: string; projectId?: string }>
}) {
  // Get today's date
  const today = new Date()
  const todayFormatted = format(today, 'yyyy年MM月dd日 EEEE', { locale: zhCN })
  
  // App development date (today)
  const appDevDate = format(today, 'yyyy年MM月dd日', { locale: zhCN })

  const filters = await searchParams
  const projectId = filters.projectId

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
                  开发任务
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
            <p>追踪 Bug、功能需求以及开发中的一切</p>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-xs">开发日期: {appDevDate}</span>
          </div>
        </header>

        <ProjectTabs />

        <ProjectIdSync />

        <Suspense fallback={null}>
          <TasksContentServer 
            projectId={projectId} 
            filters={{ status: filters.status, category: filters.category, priority: filters.priority }}
          />
        </Suspense>

        <TasksContent />
      </div>
    </main>
  )
}
