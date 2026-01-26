'use client'

import { type Task } from '@/lib/actions'
import { updateTaskStatus, deleteTask } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bug, FileText, Layers, MoreVertical, TestTube, Trash2, Wrench, FileCode, Edit } from 'lucide-react'
import { useTransition, useState } from 'react'
import { TaskEditForm } from './task-edit-form'

const categoryIcons = {
  bug: Bug,
  feature: Layers,
  refactor: Wrench,
  docs: FileText,
  test: TestTube,
  other: FileCode,
}

const categoryLabels = {
  bug: 'Bug',
  feature: '功能',
  refactor: '重构',
  docs: '文档',
  test: '测试',
  other: '其他',
}

const categories = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: '功能' },
  { value: 'refactor', label: '重构' },
  { value: 'docs', label: '文档' },
  { value: 'test', label: '测试' },
  { value: 'other', label: '其他' },
]

const categoryColors = {
  bug: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 dark:bg-red-500/20',
  feature: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20',
  refactor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:bg-amber-500/20',
  docs: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:bg-blue-500/20',
  test: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:bg-purple-500/20',
  other: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 dark:bg-slate-500/20',
}

const priorityColors = {
  low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 dark:bg-slate-500/20',
  medium: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20',
  high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20',
  critical: 'bg-red-500/15 text-red-600 dark:text-red-400 dark:bg-red-500/20',
}

const statusColors = {
  todo: 'border-l-slate-400 dark:border-l-slate-500',
  in_progress: 'border-l-amber-500 dark:border-l-amber-400',
  done: 'border-l-emerald-500 dark:border-l-emerald-400',
}

export function TaskCard({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const CategoryIcon = categoryIcons[task.category]

  const handleStatusChange = (status: Task['status']) => {
    startTransition(async () => {
      await updateTaskStatus(task.id, status)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id)
    })
  }

  return (
    <Card className={`border-l-4 ${statusColors[task.status]} ${isPending ? 'opacity-50' : ''} bg-card/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-opacity-80 border-border/60`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-md border ${categoryColors[task.category]}`}>
              <CategoryIcon className="h-3.5 w-3.5" />
            </div>
            <h3 className={`font-medium text-sm truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange('todo')} disabled={task.status === 'todo'}>
                标记为待办
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('in_progress')} disabled={task.status === 'in_progress'}>
                标记为进行中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('done')} disabled={task.status === 'done'}>
                标记为已完成
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-400 focus:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : task.priority === 'high' ? '高' : '紧急'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {task.status === 'todo' ? '待办' : task.status === 'in_progress' ? '进行中' : '已完成'}
          </Badge>
          {task.tags?.map((tag) => {
            const category = categories.find(c => c.value === tag)
            return (
              <Badge key={tag} variant="secondary" className="text-xs bg-accent/50">
                {category?.label || tag}
              </Badge>
            )
          })}
        </div>
      </CardContent>
      <TaskEditForm task={task} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </Card>
  )
}
