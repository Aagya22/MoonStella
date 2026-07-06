import mongoose, { Schema, Document } from 'mongoose'

export interface ITimelineEvent {
  stage: string
  note: string
  image?: string | null
  createdAt: Date
}

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  postId?: mongoose.Types.ObjectId | null
  title: string
  description: string
  budget: number
  status: 'pending' | 'accepted' | 'crafting' | 'shipped' | 'completed' | 'cancelled'
  currentStage: string
  deliveryLocation?: string
  paymentMethod?: string
  timeline: ITimelineEvent[]
  createdAt: Date
  updatedAt: Date
}

const TimelineEventSchema = new Schema<ITimelineEvent>({
  stage: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'crafting', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
    currentStage: {
      type: String,
      default: 'Order Placed',
    },
    deliveryLocation: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    timeline: [TimelineEventSchema],
  },
  { timestamps: true }
)

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
