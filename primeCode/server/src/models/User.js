import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
  },
  { timestamps: true },
)

userSchema.methods.toProfileJSON = function toProfileJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    bio: this.bio,
    createdAt: this.createdAt,
  }
}

export const User = mongoose.model('User', userSchema)
