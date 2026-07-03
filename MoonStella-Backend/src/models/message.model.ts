import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  text: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

MessageSchema.index({ threadId: 1, createdAt: 1 })

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
