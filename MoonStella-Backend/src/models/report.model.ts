import mongoose, { Schema, Document } from 'mongoose'

export type ReportType = 'user' | 'post' | 'chat'
export type ReportReason = 'harassment' | 'spam' | 'fraud' | 'inappropriate' | 'other'

export interface ISnapshotMessage {
  senderId: mongoose.Types.ObjectId
  senderName: string
  text: string
  createdAt: Date
}

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId
  reportedId: mongoose.Types.ObjectId
  reportedUserId: mongoose.Types.ObjectId
  type: ReportType
  reason: ReportReason
  explanation: string
  chatSnapshot: ISnapshotMessage[]
  status: 'pending' | 'resolved'
  createdAt: Date
  updatedAt: Date
}

const SnapshotMessageSchema = new Schema<ISnapshotMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
})

const ReportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['user', 'post', 'chat'],
      required: true,
    },
    reason: {
      type: String,
      enum: ['harassment', 'spam', 'fraud', 'inappropriate', 'other'],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    chatSnapshot: [SnapshotMessageSchema],
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)
