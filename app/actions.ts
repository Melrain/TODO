'use server'

import { getDb, toTask, toProject, type Task, type Project } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongodb'

// ==================== Project Actions ====================

export async function getProjects(): Promise<Project[]> {
  const db = await getDb()
  const collection = db.collection('projects')

  const projects = await collection
    .find({})
    .sort({ created_at: -1 })
    .toArray()

  return projects.map(toProject)
}

export async function createProject(data: {
  name: string
  description?: string
}): Promise<Project> {
  const db = await getDb()
  const collection = db.collection('projects')

  const now = new Date().toISOString()
  
  const project = {
    name: data.name,
    description: data.description || null,
    created_at: now,
    updated_at: now,
  }

  const result = await collection.insertOne(project)
  
  revalidatePath('/', 'layout')
  
  return toProject({ _id: result.insertedId, ...project })
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) {
  const db = await getDb()
  const collection = db.collection('projects')

  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid project ID')
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  )
  
  revalidatePath('/', 'layout')
}

export async function deleteProject(id: string) {
  const db = await getDb()
  const projectsCollection = db.collection('projects')
  const tasksCollection = db.collection('tasks')

  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid project ID')
  }

  // Delete all tasks in this project first
  await tasksCollection.deleteMany({ projectId: id })
  
  // Then delete the project
  await projectsCollection.deleteOne({ _id: new ObjectId(id) })
  
  revalidatePath('/', 'layout')
}

// ==================== Task Actions ====================

// Get all tasks with optional filters
export async function getTasks(filters?: {
  projectId?: string
  status?: string
  category?: string
  priority?: string
}): Promise<Task[]> {
  const db = await getDb()
  const collection = db.collection('tasks')

  const query: any = {}
  
  if (filters?.projectId) {
    query.projectId = filters.projectId
  }
  
  if (filters?.status && filters.status !== 'all') {
    query.status = filters.status
  }
  
  if (filters?.category && filters.category !== 'all') {
    query.category = filters.category
  }
  
  if (filters?.priority && filters.priority !== 'all') {
    query.priority = filters.priority
  }

  const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 }
  const statusOrder = { in_progress: 1, todo: 2, done: 3 }

  // Fetch all tasks matching the query, sorted by created_at descending
  const tasks = await collection
    .find(query)
    .sort({ created_at: -1 })
    .toArray()

  // Manual sorting since MongoDB doesn't support custom sort orders for priority/status
  return tasks
    .map(toTask)
    .sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5)
      if (priorityDiff !== 0) return priorityDiff
      
      const statusDiff = (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
      if (statusDiff !== 0) return statusDiff
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

export async function createTask(data: {
  projectId: string
  title: string
  description?: string
  category: Task['category']
  priority: Task['priority']
  tags?: string[]
}) {
  const db = await getDb()
  const collection = db.collection('tasks')

  const now = new Date().toISOString()
  
  const task = {
    projectId: data.projectId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    priority: data.priority,
    status: 'todo' as const,
    tags: data.tags || [],
    created_at: now,
    updated_at: now,
  }

  await collection.insertOne(task)
  
  revalidatePath('/', 'layout')
}

export async function updateTaskStatus(id: string, status: Task['status']) {
  const db = await getDb()
  const collection = db.collection('tasks')

  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid task ID')
  }

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status,
        updated_at: new Date().toISOString()
      } 
    }
  )
  
  revalidatePath('/', 'layout')
}

export async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) {
  const db = await getDb()
  const collection = db.collection('tasks')

  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid task ID')
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.status !== undefined) updateData.status = data.status
  if (data.tags !== undefined) updateData.tags = data.tags

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  )
  
  revalidatePath('/', 'layout')
}

export async function deleteTask(id: string) {
  const db = await getDb()
  const collection = db.collection('tasks')

  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid task ID')
  }

  await collection.deleteOne({ _id: new ObjectId(id) })
  
  revalidatePath('/', 'layout')
}
