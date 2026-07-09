import mongoose, { Schema, Document } from 'mongoose'

export type NotificationType = 'message' | 'order' | 'like' | 'follow' | 'review' | 'system'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  actorId?: mongoose.Types.ObjectId
  type: NotificationType
  text: string
  link?: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['message', 'order', 'like', 'follow', 'review', 'system'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Role-agnostic path suffix the frontend prefixes with the current role, e.g. 'orders', 'messages', 'feed'
    link: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema)
