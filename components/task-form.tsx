'use client'

import { createTask } from '@/lib/actions'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { useTaskStore } from '@/lib/store'
import { Checkbox } from '@/components/ui/checkbox'

const categories = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: '功能' },
  { value: 'refactor', label: '重构' },
  { value: 'docs', label: '文档' },
  { value: 'test', label: '测试' },
  { value: 'other', label: '其他' },
]

export function TaskForm() {
  const { isTaskFormOpen, setTaskFormOpen, triggerRefresh, currentProjectId } = useTaskStore()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [tags, setTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const handleSubmit = (formData: FormData) => {
    if (!currentProjectId) {
      alert('请先选择一个项目')
      return
    }

    startTransition(async () => {
      await createTask({
        projectId: currentProjectId,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as any,
        priority: formData.get('priority') as any,
        tags,
      })
      setTags([])
      setOpen(false)
      setTaskFormOpen(false)
      triggerRefresh()
    })
  }

  return (
    <Dialog open={open || isTaskFormOpen} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      setTaskFormOpen(isOpen)
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新建任务
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建新任务</DialogTitle>
          <DialogDescription>
            填写任务信息以创建新任务
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input id="title" name="title" placeholder="修复认证漏洞..." required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="描述任务内容..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select name="category" defaultValue="feature">
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
              <Select name="priority" defaultValue="medium">
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
            <Label>标签（可多选）</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${category.value}`}
                    checked={tags.includes(category.value)}
                    onCheckedChange={() => toggleTag(category.value)}
                  />
                  <label
                    htmlFor={`tag-${category.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
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
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              setTaskFormOpen(false)
            }}>
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '创建中...' : '创建任务'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
