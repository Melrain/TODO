import { getTasks } from '@/lib/actions'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle, Clock, ListTodo } from 'lucide-react'

export async function TaskStats({ projectId }: { projectId?: string }) {
  const tasks = await getTasks({ projectId })
  
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      <Card className="bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-slate-200/60 dark:border-slate-800">
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
      
      <Card className="bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-slate-200/60 dark:border-slate-800">
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
      
      <Card className="bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-amber-200/60 dark:border-amber-900/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/20">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">进行中</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 border-emerald-200/60 dark:border-emerald-900/50">
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
