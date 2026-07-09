import type { Request, Response } from 'express'
import { Notification } from '../models/notification.model'
import { ok, badRequest, serverError } from '../utils/response'

// GET /api/notifications - current user's notifications (newest first)
export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const notifications = await Notification.find({ userId })
      .populate('actorId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({ userId, read: false })

    ok(res, { notifications, unreadCount })
  } catch (err) {
    serverError(res, err)
  }
}

// PATCH /api/notifications/read - mark all as read
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      badRequest(res, 'Unauthorized')
      return
    }

    await Notification.updateMany({ userId, read: false }, { $set: { read: true } })
    ok(res, { success: true })
  } catch (err) {
    serverError(res, err)
  }
}

// PATCH /api/notifications/:id/read - mark one as read
export const markOneRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const { id } = req.params
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    )
    ok(res, notification)
  } catch (err) {
    serverError(res, err)
  }
}
