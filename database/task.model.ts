import { Schema, models, model, Document } from "mongoose";

export interface ITask extends Document {
  projectId: string;
  title: string;
  description: string | null;
  category: 'bug' | 'feature' | 'refactor' | 'docs' | 'test' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'done';
  tags: string[];
  created_at: string;
  updated_at: string;
}

const TaskSchema = new Schema({
  projectId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'refactor', 'docs', 'test', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo',
  },
  tags: {
    type: [String],
    default: [],
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const Task = models.Task || model<ITask>("Task", TaskSchema);

export default Task;
