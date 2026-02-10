'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle, ListTodo } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/lib/store'

type Stats = {
  total: number
  todo: number
  done: number
}

export function TaskStatsClient({ stats }: { stats: Stats }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setFilters, filters } = useTaskStore()
  const currentStatus = searchParams.get('status') ?? 'todo'

  const handleFilterClick = (status: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (status === null || status === 'all') {
      params.set('status', 'all')
      setFilters({ ...filters, status: 'all' })
    } else {
      params.set('status', status)
      setFilters({ ...filters, status })
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
      <Card
        onClick={() => handleFilterClick(null)}
        className={cn(
          "bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-slate-200/60 dark:border-slate-800 cursor-pointer",
          currentStatus === 'all' && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-slate-500/15 dark:bg-slate-500/20 border border-slate-500/20">
            <ListTodo className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">总计</p>
          </div>
        </CardContent>
      </Card>
      
      <Card
        onClick={() => handleFilterClick('todo')}
        className={cn(
          "bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-slate-200/60 dark:border-slate-800 cursor-pointer",
          currentStatus === 'todo' && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-slate-500/15 dark:bg-slate-500/20 border border-slate-500/20">
            <Circle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.todo}</p>
            <p className="text-xs text-muted-foreground">待办</p>
          </div>
        </CardContent>
      </Card>
      
      <Card
        onClick={() => handleFilterClick('done')}
        className={cn(
          "bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-emerald-200/60 dark:border-emerald-900/50 cursor-pointer",
          currentStatus === 'done' && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/20">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.done}</p>
            <p className="text-xs text-muted-foreground">已完成</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
