import { Notification } from '../models/notification.model'
import { io } from '../server'

interface NotifyInput {
  userId: string | any // recipient
  actorId?: string | any // who triggered it (optional)
  type: 'message' | 'order' | 'like' | 'follow' | 'review' | 'system'
  text: string
  link?: string
}

/**
 * Create a notification for a user and push it in real-time via socket.
 * Never throws — notification failures must not break the triggering action.
 */
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
