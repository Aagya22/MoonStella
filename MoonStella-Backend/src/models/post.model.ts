import mongoose, { Schema, Document } from 'mongoose'

export interface IComment {
  userId: mongoose.Types.ObjectId
  text: string
  createdAt: Date
}

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId
  description: string
  category: string
  budget?: number | null
  price?: string | null
  materials: string[]
  images: string[]
  likes: mongoose.Types.ObjectId[]
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

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
    ],
    comments: [CommentSchema]
  },
  { timestamps: true }
)

export const Post = mongoose.model<IPost>('Post', PostSchema)
