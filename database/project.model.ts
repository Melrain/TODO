import { Schema, models, model, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
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

const Project = models.Project || model<IProject>("Project", ProjectSchema);

export default Project;
