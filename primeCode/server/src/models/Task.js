import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
)

taskSchema.index({ title: 'text', description: 'text' })

taskSchema.methods.toResponseJSON = function toResponseJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    status: this.status,
    priority: this.priority,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Task = mongoose.model('Task', taskSchema)
