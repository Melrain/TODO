// Export all project actions
export {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type ProjectType,
} from "./project.action";

// Export all task actions
export {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  type TaskType,
} from "./task.action";

// Re-export types for backward compatibility
export type Project = import("./project.action").ProjectType;
export type Task = import("./task.action").TaskType;
