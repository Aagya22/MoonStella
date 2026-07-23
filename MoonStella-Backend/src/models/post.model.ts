import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId
  description: string
  category: string
  budget?: number | null
  price?: string | null
  materials: string[]
  images: string[]
  likes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    budget: {
      type: Number,
      default: null
    },
    price: {
      type: String,
      default: null
    },
    materials: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
)

export const Post = mongoose.model<IPost>('Post', PostSchema)
