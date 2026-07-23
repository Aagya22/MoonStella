import { Notification } from '../models/notification.model'
import { User } from '../models/user.model'
import { io } from '../server'

interface NotifyInput {
  userId: string | any // recipient
  actorId?: string | any // who triggered it (optional)
  type: 'message' | 'order' | 'like' | 'follow' | 'review' | 'system'
  text: string
  link?: string
}

// Create a notification for a user and push it over the socket
export const createNotification = async (input: NotifyInput): Promise<void> => {
  try {
    // Don't notify a user about their own action
    if (input.actorId && String(input.actorId) === String(input.userId)) return

    const notification = await Notification.create({
      userId: input.userId,
      actorId: input.actorId || null,
      type: input.type,
      text: input.text,
      link: input.link || null,
    })

    const populated = await Notification.findById(notification._id).populate(
      'actorId',
      'firstName lastName avatar'
    )

    io.to(`user:${String(input.userId)}`).emit('notification', populated)
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

// Create a notification for every admin
export const notifyAdmins = async (input: Omit<NotifyInput, 'userId'>): Promise<void> => {
  try {
    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      await createNotification({
        ...input,
        userId: admin._id,
      })
    }
  } catch (err) {
    console.error('Failed to notify admins:', err)
  }
}
