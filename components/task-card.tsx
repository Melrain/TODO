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

const statusColors: Record<string, string> = {
  todo: 'border-l-slate-400 dark:border-l-slate-500',
  done: 'border-l-emerald-500 dark:border-l-emerald-400',
}

// 根据优先级设置边框颜色
const priorityBorderColors = {
  low: 'border-slate-300 dark:border-slate-600',
  medium: 'border-blue-400 dark:border-blue-500',
  high: 'border-orange-400 dark:border-orange-500',
  critical: 'border-red-400 dark:border-red-500',
}

// 根据优先级设置阴影颜色
const priorityShadowColors = {
  low: 'shadow-slate-200/50 dark:shadow-slate-800/50',
  medium: 'shadow-blue-200/50 dark:shadow-blue-900/50',
  high: 'shadow-orange-200/50 dark:shadow-orange-900/50',
  critical: 'shadow-red-200/50 dark:shadow-red-900/50',
}

// 根据优先级设置 hover 时的阴影颜色
const priorityHoverShadowColors = {
  low: 'hover:shadow-slate-300/60 dark:hover:shadow-slate-700/60',
  medium: 'hover:shadow-blue-300/60 dark:hover:shadow-blue-800/60',
  high: 'hover:shadow-orange-300/60 dark:hover:shadow-orange-800/60',
  critical: 'hover:shadow-red-300/60 dark:hover:shadow-red-800/60',
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
    <Card className={`border-l-4 ${statusColors[task.status] ?? statusColors.todo} 
      border-t border-r border-b ${priorityBorderColors[task.priority]}
      ${isPending ? 'opacity-50' : ''} 
      bg-card
      transition-all duration-300 ease-out
      shadow-sm ${priorityShadowColors[task.priority]}
      ${priorityHoverShadowColors[task.priority]}
      hover:shadow-lg hover:-translate-y-1 
      hover:scale-[1.02]
      hover:border-opacity-100
      cursor-pointer
      group`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-md border transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm ${categoryColors[task.category]}`}>
              <CategoryIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-3" />
            </div>
            <h3 className={`font-medium text-sm truncate transition-colors duration-300 ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
              {task.title}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-foreground/80">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : task.priority === 'high' ? '高' : '紧急'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {task.status === 'done' ? '已完成' : '待办'}
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
