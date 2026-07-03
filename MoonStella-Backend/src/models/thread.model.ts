import mongoose, { Schema, Document } from 'mongoose'

export interface IThread extends Document {
  participants: mongoose.Types.ObjectId[]
  lastMessageText?: string
  lastMessageSenderId?: mongoose.Types.ObjectId
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ThreadSchema = new Schema<IThread>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    ],
    lastMessageText: { type: String, default: '' },
    lastMessageSenderId: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Thread = mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema)
