'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTaskStore } from '@/lib/store'
import { useEffect } from 'react'

export function TaskFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { filters, setFilters } = useTaskStore()

  // Sync URL params with store on mount
  useEffect(() => {
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const priority = searchParams.get('priority') || undefined
    
    if (status || category || priority) {
      setFilters({ status, category, priority })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
      setFilters({ ...filters, [key]: undefined })
    } else {
      params.set(key, value)
      setFilters({ ...filters, [key]: value })
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.status || searchParams.get('status') || 'all'}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="todo">待办</SelectItem>
          <SelectItem value="in_progress">进行中</SelectItem>
          <SelectItem value="done">已完成</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category || searchParams.get('category') || 'all'}
        onValueChange={(value) => updateFilter('category', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="feature">功能</SelectItem>
          <SelectItem value="refactor">重构</SelectItem>
          <SelectItem value="docs">文档</SelectItem>
          <SelectItem value="test">测试</SelectItem>
          <SelectItem value="other">其他</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || searchParams.get('priority') || 'all'}
        onValueChange={(value) => updateFilter('priority', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="优先级" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部优先级</SelectItem>
          <SelectItem value="low">低</SelectItem>
          <SelectItem value="medium">中</SelectItem>
          <SelectItem value="high">高</SelectItem>
          <SelectItem value="critical">紧急</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
