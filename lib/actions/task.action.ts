"use server"

import Task from "@/database/task.model";
import { connectToDatabase } from "../mongoose";
import { revalidatePath } from "next/cache";

export type TaskType = {
  _id?: string;
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: "bug" | "feature" | "refactor" | "docs" | "test" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "done";
  tags: string[];
  created_at: string;
  updated_at: string;
};

export async function getTasks(filters?: {
  projectId?: string;
  status?: string;
  category?: string;
  priority?: string;
}): Promise<TaskType[]> {
  try {
    await connectToDatabase();

    const query: any = {};

    if (filters?.projectId) {
      query.projectId = filters.projectId;
    }

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.category && filters.category !== "all") {
      query.category = filters.category;
    }

    if (filters?.priority && filters.priority !== "all") {
      query.priority = filters.priority;
    }

    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    const statusOrder = { in_progress: 1, todo: 2, done: 3 };

    // Fetch all tasks matching the query, sorted by created_at descending
    const tasks = await Task.find(query).sort({ created_at: -1 }).lean();

    // Manual sorting since MongoDB doesn't support custom sort orders for priority/status
    return tasks
      .map((task: any) => ({
        id: task._id.toString(),
        projectId: task.projectId || "",
        title: task.title,
        description: task.description || null,
        category: task.category,
        priority: task.priority,
        status: task.status,
        tags: task.tags || [],
        created_at: task.created_at,
        updated_at: task.updated_at,
      }))
      .sort((a, b) => {
        const priorityDiff =
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 5);
        if (priorityDiff !== 0) return priorityDiff;

        const statusDiff =
          (statusOrder[a.status as keyof typeof statusOrder] || 4) -
          (statusOrder[b.status as keyof typeof statusOrder] || 4);
        if (statusDiff !== 0) return statusDiff;

        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  category: TaskType["category"];
  priority: TaskType["priority"];
  tags?: string[];
}) {
  try {
    await connectToDatabase();

    const now = new Date().toISOString();

    await Task.create({
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      category: data.category,
      priority: data.priority,
      status: "todo",
      tags: data.tags || [],
      created_at: now,
      updated_at: now,
    });

    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskType["status"]
) {
  try {
    await connectToDatabase();

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error("Invalid task ID");
    }

    await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          updated_at: new Date().toISOString(),
        },
      },
      { new: true }
    );

    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateTask(
  id: string,
  data: Partial<Omit<TaskType, "id" | "created_at" | "updated_at">>
) {
  try {
    await connectToDatabase();

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error("Invalid task ID");
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = data.tags;

    await Task.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteTask(id: string) {
  try {
    await connectToDatabase();

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error("Invalid task ID");
    }

    await Task.findByIdAndDelete(id);

    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}
