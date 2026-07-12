import type { Request, Response, NextFunction } from 'express'
import { Report } from '../models/report.model'
import { User } from '../models/user.model'
import { Post } from '../models/post.model'
import { Thread } from '../models/thread.model'
import { Message } from '../models/message.model'
import { createNotification } from '../services/notification.service'
import { ok, created, badRequest, notFound } from '../utils/response'
import mongoose from 'mongoose'

export const createReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, reportedId, reason, explanation } = req.body
    const reporterId = String((req.user as any)._id)

    if (!['user', 'post', 'chat'].includes(type)) {
      badRequest(res, 'Invalid report type')
      return
    }

    if (!reportedId || !reason || !explanation) {
      badRequest(res, 'Missing required fields')
      return
    }

    let reportedUserId: string | null = null
    let chatSnapshot: any[] = []

    if (type === 'user') {
      const user = await User.findById(reportedId)
      if (!user) {
        notFound(res, 'Not found')
        return
      }
      reportedUserId = String(user._id)

    } else if (type === 'post') {
      const post = await Post.findById(reportedId)
      if (!post) {
        notFound(res, 'Not found')
        return
      }
      reportedUserId = String(post.userId)

    } else if (type === 'chat') {
      const thread = await Thread.findById(reportedId)
      if (!thread) {
        notFound(res, 'Not found')
        return
      }
      // Find the other participant
      const otherId = thread.participants.find((pId: any) => String(pId) !== String(reporterId))
      if (!otherId) {
        badRequest(res, 'Thread has no other participants')
        return
      }
      reportedUserId = String(otherId)

      // Take message snapshot (last 15 messages)
      const messages = await Message.find({ threadId: reportedId })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('senderId', 'firstName lastName')

      chatSnapshot = messages.reverse().map((msg: any) => ({
        senderId: msg.senderId?._id || msg.senderId,
        senderName: msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : 'User',
        text: msg.text || (msg.image ? '[Attached Image]' : '[Attached Audio/Media]'),
        createdAt: msg.createdAt,
      }))
    }

    if (!reportedUserId) {
      badRequest(res, 'Could not determine reported user')
      return
    }

    const report = await Report.create({
      reporterId,
      reportedId,
      reportedUserId,
      type,
      reason,
      explanation,
      chatSnapshot,
      status: 'pending',
    })

    created(res, report, 'Report submitted successfully')
  } catch (err) {
    next(err)
  }
}

export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .populate('reporterId', 'firstName lastName email avatar role')
      .populate('reportedUserId', 'firstName lastName email avatar role isApproved isSuspended')

    // Attach post/listing info if the type is 'post'
    const enrichedReports = await Promise.all(
      reports.map(async (r: any) => {
        let reportedItemDetails: any = null
        if (r.type === 'post') {
          reportedItemDetails = await Post.findById(r.reportedId)
        }
        return {
          ...r.toObject(),
          reportedItemDetails,
        }
      })
    )

    ok(res, enrichedReports)
  } catch (err) {
    next(err)
  }
}

export const resolveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { action } = req.body // 'resolve', 'suspend', 'delete_post'

    const report = await Report.findById(id)
    if (!report) {
      notFound(res, 'Not found')
      return
    }

    report.status = 'resolved'

    if (action === 'suspend') {
      const user = await User.findById(report.reportedUserId)
      if (user) {
        user.isSuspended = true
        await user.save()

        await createNotification({
          userId: user._id,
          type: 'system',
          text: 'Your account has been suspended by the administrator following user reports.',
          link: '',
        })
      }
    } else if (action === 'delete_post' && report.type === 'post') {
      const post = await Post.findById(report.reportedId)
      if (post) {
        await Post.findByIdAndDelete(report.reportedId)

        await createNotification({
          userId: report.reportedUserId,
          type: 'system',
          text: `Your listing post under "${post.category}" has been deleted by the administrator after review of user reports.`,
          link: '',
        })
      }
    }

    await report.save()
    ok(res, report, 'Report resolved successfully')
  } catch (err) {
    next(err)
  }
}
