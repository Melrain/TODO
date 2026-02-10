'use client'

import { type Task } from '@/lib/actions'
import { updateTask } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { useState, useTransition, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const categories = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: '功能' },
  { value: 'refactor', label: '重构' },
  { value: 'docs', label: '文档' },
  { value: 'test', label: '测试' },
  { value: 'other', label: '其他' },
]

export function TaskEditForm({ 
  task, 
  open, 
  onOpenChange 
}: { 
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [category, setCategory] = useState<Task['category']>(task.category)
  const [priority, setPriority] = useState<Task['priority']>(task.priority)
  const [status, setStatus] = useState<Task['status']>(task.status)
  const [tags, setTags] = useState<string[]>(task.tags || [])

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description || '')
    setCategory(task.category)
    setPriority(task.priority)
    setStatus(task.status)
    setTags(task.tags || [])
  }, [task])

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await updateTask(task.id, {
        title,
        description: description || null,
        category,
        priority,
        status,
        tags,
      })
      onOpenChange(false)
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle(task.title)
      setDescription(task.description || '')
      setCategory(task.category)
      setPriority(task.priority)
      setStatus(task.status)
      setTags(task.tags || [])
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
          <DialogDescription>
            修改任务信息并保存更改
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">标题</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="修复认证漏洞..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">描述</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述任务内容..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={category} onValueChange={(value: Task['category']) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">功能</SelectItem>
                  <SelectItem value="refactor">重构</SelectItem>
                  <SelectItem value="docs">文档</SelectItem>
                  <SelectItem value="test">测试</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>优先级</Label>
              <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="critical">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">待办</SelectItem>
                <SelectItem value="done">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>标签（可多选）</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-tag-${cat.value}`}
                    checked={tags.includes(cat.value)}
                    onCheckedChange={() => toggleTag(cat.value)}
                  />
                  <label
                    htmlFor={`edit-tag-${cat.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {cat.label}
                  </label>
                </div>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => {
                  const category = categories.find(c => c.value === tag)
                  return (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {category?.label || tag}
                      <button type="button" onClick={() => toggleTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
