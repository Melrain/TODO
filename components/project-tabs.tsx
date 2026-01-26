'use client'

import { getProjects, createProject, deleteProject } from '@/app/actions'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTaskStore } from '@/lib/store'
import { type Project } from '@/lib/db'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'

export function ProjectTabs() {
  const { currentProjectId, setCurrentProjectId } = useTaskStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isPending, startTransition] = useTransition()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
      // If no project selected and we have projects, select the first one
      // Only set if we don't have a currentProjectId to avoid infinite loop
      const currentId = useTaskStore.getState().currentProjectId
      if (!currentId && data.length > 0) {
        setCurrentProjectId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId)
    // Trigger refresh only when user manually changes project
    useTaskStore.getState().triggerRefresh()
  }

  const handleCreateProject = async (formData: FormData) => {
    startTransition(async () => {
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      
      if (!name.trim()) return

      const newProject = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      
      await loadProjects()
      setCurrentProjectId(newProject.id)
      setIsCreateOpen(false)
      useTaskStore.getState().triggerRefresh()
    })
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？这将删除该项目下的所有任务。')) {
      return
    }

    startTransition(async () => {
      await deleteProject(projectId)
      await loadProjects()
      // If deleted project was selected, select first project or clear
      if (currentProjectId === projectId) {
        const remaining = projects.filter(p => p.id !== projectId)
        setCurrentProjectId(remaining.length > 0 ? remaining[0].id : '')
      }
    })
  }

  if (projects.length === 0 && !isPending) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <p className="text-sm text-muted-foreground">暂无项目，</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              创建第一个项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
            </DialogHeader>
            <form action={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">项目名称</Label>
                <Input id="project-name" name="name" placeholder="我的项目" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">项目描述（可选）</Label>
                <Textarea
                  id="project-description"
                  name="description"
                  placeholder="项目描述..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? '创建中...' : '创建'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <Tabs value={currentProjectId || ''} onValueChange={handleProjectChange}>
        <div className="flex items-center justify-between mb-2">
          <TabsList className="flex-wrap h-auto">
            {projects.map((project) => (
              <TabsTrigger
                key={project.id}
                value={project.id}
                className="relative group"
              >
                <span className="pr-6">{project.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 focus:text-red-400"
                    >
                      <X className="h-4 w-4 mr-2" />
                      删除项目
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsTrigger>
            ))}
          </TabsList>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                新建项目
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
              </DialogHeader>
              <form action={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">项目名称</Label>
                  <Input id="project-name" name="name" placeholder="我的项目" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">项目描述（可选）</Label>
                  <Textarea
                    id="project-description"
                    name="description"
                    placeholder="项目描述..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? '创建中...' : '创建'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Tabs>
    </div>
  )
}
