import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId
  buyerId: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  rating: number
  comment: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

export const Review =
  mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema)
