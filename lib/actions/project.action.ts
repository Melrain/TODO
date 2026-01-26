"use server"

import Project from "@/database/project.model";
import { connectToDatabase } from "../mongoose";
import Task from "@/database/task.model";
import { revalidatePath } from "next/cache";

export type ProjectType = {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export async function getProjects(): Promise<ProjectType[]> {
  try {
    await connectToDatabase();

    const projects = await Project.find({})
      .sort({ created_at: -1 })
      .lean();

    return projects.map((project: any) => ({
      id: project._id.toString(),
      name: project.name,
      description: project.description || undefined,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createProject(data: {
  name: string;
  description?: string;
}): Promise<ProjectType> {
  try {
    await connectToDatabase();

    const now = new Date().toISOString();

    const newProject = await Project.create({
      name: data.name,
      description: data.description || null,
      created_at: now,
      updated_at: now,
    });

    revalidatePath("/", "layout");

    return {
      id: newProject._id.toString(),
      name: newProject.name,
      description: newProject.description || undefined,
      created_at: newProject.created_at,
      updated_at: newProject.updated_at,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateProject(
  id: string,
  data: Partial<Omit<ProjectType, "id" | "created_at" | "updated_at">>
) {
  try {
    await connectToDatabase();

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error("Invalid project ID");
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    await Project.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteProject(id: string) {
  try {
    await connectToDatabase();

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error("Invalid project ID");
    }

    // Delete all tasks in this project first
    await Task.deleteMany({ projectId: id });

    // Then delete the project
    await Project.findByIdAndDelete(id);

    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}
