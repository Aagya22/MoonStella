import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Thread } from '../models/thread.model'
import { Message } from '../models/message.model'
import { User } from '../models/user.model'
import { ok, created, badRequest, serverError, notFound } from '../utils/response'
import { io } from '../server'

export const createOrGetThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { participantId, participantName } = req.body
    const currentUserId = req.user?._id

    if (!currentUserId) {
      badRequest(res, 'Unauthorized')
      return
    }

    let targetUser: any = null

    if (participantId && mongoose.Types.ObjectId.isValid(participantId)) {
      targetUser = await User.findById(participantId)
    }

    if (!targetUser && participantName) {
      const parts = participantName.trim().split(/\s+/)
      const firstName = parts[0]
      const lastName = parts.slice(1).join(' ')

      const query = lastName
        ? {
            firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
            lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
          }
        : {
            firstName: { $regex: new RegExp(`^${firstName}$`, 'i') }
          }

      targetUser = await User.findOne(query)
    }

    if (!targetUser) {
      badRequest(res, 'Participant user not found')
      return
    }

    if (String(targetUser._id) === String(currentUserId)) {
      badRequest(res, 'You cannot start a chat thread with yourself')
      return
    }

    let thread = await Thread.findOne({
      participants: { $all: [currentUserId, targetUser._id], $size: 2 }
    }).populate('participants', 'firstName lastName email role avatar location bio averageResponseTime')

    if (!thread) {
      thread = new Thread({
        participants: [currentUserId, targetUser._id],
        lastMessageText: '',
        lastMessageAt: new Date()
      })
      await thread.save()
      thread = await Thread.findById(thread._id).populate('participants', 'firstName lastName email role avatar location bio averageResponseTime')
    }

    ok(res, thread)
  } catch (err) {
    serverError(res, err)
  }
}

export const getThreads = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id

    if (!currentUserId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const threads = await Thread.find({
      participants: currentUserId
    })
      .populate('participants', 'firstName lastName email role avatar location bio averageResponseTime')
      .sort({ lastMessageAt: -1 })

    ok(res, threads)
  } catch (err) {
    serverError(res, err)
  }
}

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { threadId } = req.params
    const currentUserId = req.user?._id

    if (!currentUserId) {
      badRequest(res, 'Unauthorized')
      return
    }

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      badRequest(res, 'Invalid Thread ID')
      return
    }

    const thread = await Thread.findById(threadId)
    if (!thread) {
      notFound(res, 'Not found')
      return
    }

    const isParticipant = thread.participants.some(
      (id: any) => String(id) === String(currentUserId)
    )

    if (!isParticipant) {
      badRequest(res, 'Access Denied: You are not a participant of this conversation')
      return
    }

    const { limit = '20', before } = req.query
    const parsedLimit = Math.min(Number(limit), 100)

    const query: any = { threadId }
    if (before) {
      query.createdAt = { $lt: new Date(before as string) }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .populate('senderId', 'firstName lastName email avatar role')
      .populate({
        path: 'postId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email avatar role bio'
        }
      })

    messages.reverse()
    ok(res, messages)
  } catch (err) {
    serverError(res, err)
  }
}

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { threadId } = req.params
    const { text, postId, image, voice } = req.body
    const currentUserId = req.user?._id

    if (!currentUserId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const trimmedText = text ? text.trim() : ''

    if (!trimmedText && !image && !voice) {
      badRequest(res, 'Message text, image, or voice is required')
      return
    }

    if (trimmedText.length > 5000) {
      badRequest(res, 'Message text exceeds 5000 characters limit')
      return
    }

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      badRequest(res, 'Invalid Thread ID')
      return
    }

    const thread = await Thread.findById(threadId)
    if (!thread) {
      notFound(res, 'Not found')
      return
    }

    const isParticipant = thread.participants.some(
      (id: any) => String(id) === String(currentUserId)
    )

    if (!isParticipant) {
      badRequest(res, 'Access Denied: You are not a participant of this conversation')
      return
    }

    const message = new Message({
      threadId,
      senderId: currentUserId,
      text: trimmedText,
      postId: postId || undefined,
      image: image || undefined,
      voice: voice || undefined
    })
    await message.save()

    let lastText = trimmedText
    if (!lastText) {
      if (voice) {
        lastText = '[Voice Message]'
      } else {
        lastText = '[Image]'
      }
    }

    thread.lastMessageText = lastText
    thread.lastMessageSenderId = currentUserId
    thread.lastMessageAt = new Date()
    await thread.save()

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'firstName lastName email avatar role')
      .populate({
        path: 'postId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email avatar role bio'
        }
      })

    io.to(`thread:${threadId}`).emit('new_message', populatedMessage)

    created(res, populatedMessage)
  } catch (err) {
    serverError(res, err)
  }
}
