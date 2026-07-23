import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Order } from '../models/order.model'
import { Thread } from '../models/thread.model'
import { Message } from '../models/message.model'
import { User } from '../models/user.model'
import { Review } from '../models/review.model'
import { io } from '../server'
import { createNotification, notifyAdmins } from '../services/notification.service'
import { ok, created, badRequest, serverError, notFound } from '../utils/response'

const emitThreadMessage = async (threadId: any, messageId: any): Promise<void> => {
  const populated = await Message.findById(messageId)
    .populate('senderId', 'firstName lastName email avatar role')
    .populate({
      path: 'postId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email avatar role bio'
      }
    })

  io.to(`thread:${String(threadId)}`).emit('new_message', populated)
}

// Tag each order with whether it already has a review
const withReviewFlags = async (orders: any[]): Promise<any[]> => {
  if (!orders.length) return []

  const reviews = await Review.find({ orderId: { $in: orders.map((o) => o._id) } }).select('orderId')
  const reviewed = new Set(reviews.map((r: any) => String(r.orderId)))

  return orders.map((o) => {
    const obj = typeof o.toObject === 'function' ? o.toObject() : o
    obj.hasReview = reviewed.has(String(obj._id))
    return obj
  })
}

// Create Order (Buyer initiates bespoke brief order)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sellerId, postId, title, description, budget, deliveryLocation, paymentMethod } = req.body
    const buyerId = req.user?._id

    if (!buyerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    if (!sellerId || !title || !description || !budget || !deliveryLocation || !paymentMethod) {
      badRequest(res, 'Missing required fields: sellerId, title, description, budget, deliveryLocation, paymentMethod')
      return
    }

    const seller = await User.findById(sellerId)
    if (!seller || seller.role !== 'seller') {
      badRequest(res, 'Invalid seller ID')
      return
    }

    const order = new Order({
      buyerId,
      sellerId,
      postId: postId || null,
      title,
      description,
      budget,
      deliveryLocation,
      paymentMethod,
      status: 'pending',
      currentStage: 'Order Requested',
      timeline: [
        {
          stage: 'Order Brief Submitted',
          note: `Bespoke commission request for "${title}" sent to ${seller.firstName} ${seller.lastName} with an estimated budget of Rs. ${budget.toLocaleString()}.`,
          image: null,
          createdAt: new Date(),
        },
      ],
    })

    await order.save()

    // Send notification in chat thread
    let thread = await Thread.findOne({
      participants: { $all: [buyerId, sellerId], $size: 2 },
    })

    if (!thread) {
      thread = new Thread({
        participants: [buyerId, sellerId],
        lastMessageText: '',
        lastMessageAt: new Date(),
      })
      await thread.save()
    }

    const sysMsgText = `BESPOKE ORDER REQUESTED:\n"${title}" (Rs. ${budget.toLocaleString()})\n\nDescription: ${description}`
    const systemMsg = new Message({
      threadId: thread._id,
      senderId: buyerId,
      text: sysMsgText,
      postId: postId || null,
      createdAt: new Date(),
    })
    await systemMsg.save()

    thread.lastMessageText = `Bespoke Order Requested: "${title}"`
    thread.lastMessageAt = new Date()
    await thread.save()

    // Socket.io live notification
    await emitThreadMessage(thread._id, systemMsg._id)

    await createNotification({
      userId: sellerId,
      actorId: buyerId,
      type: 'order',
      text: `New commission request: "${title}"`,
      link: 'orders',
    })

    created(res, order)
  } catch (err) {
    serverError(res, err)
  }
}

// Get Buyer's orders
export const getBuyerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyerId = req.user?._id
    if (!buyerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const pageVal = req.query.page
    const filter = { buyerId }

    if (!pageVal) {
      const orders = await Order.find(filter)
        .populate('sellerId', 'firstName lastName email avatar role location bio averageResponseTime')
        .populate('postId', 'images description category budget')
        .sort({ createdAt: -1 })
      ok(res, await withReviewFlags(orders))
      return
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const totalDocs = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('sellerId', 'firstName lastName email avatar role location bio averageResponseTime')
      .populate('postId', 'images description category budget')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(totalDocs / limit)

    ok(res, {
      docs: await withReviewFlags(orders),
      page,
      limit,
      totalPages,
      totalDocs
    })
  } catch (err) {
    serverError(res, err)
  }
}

// Get Seller's orders
export const getSellerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?._id
    if (!sellerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const pageVal = req.query.page
    const filter = { sellerId }

    if (!pageVal) {
      const orders = await Order.find(filter)
        .populate('buyerId', 'firstName lastName email avatar role location bio')
        .populate('postId', 'images description category budget')
        .sort({ createdAt: -1 })
      ok(res, orders)
      return
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const totalDocs = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('buyerId', 'firstName lastName email avatar role location bio')
      .populate('postId', 'images description category budget')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(totalDocs / limit)

    ok(res, {
      docs: orders,
      page,
      limit,
      totalPages,
      totalDocs
    })
  } catch (err) {
    serverError(res, err)
  }
}

// Accept Order (Seller accepts, status changes to crafting)
export const acceptOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const sellerId = req.user?._id

    if (!sellerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (String(order.sellerId) !== String(sellerId)) {
      badRequest(res, 'Unauthorized to modify this order')
      return
    }

    order.status = 'accepted'
    order.currentStage = 'Design & Blueprint Approved'
    order.timeline.push({
      stage: 'Design & Blueprint Approved',
      note: 'The artisan has accepted your commission. The blueprint designs are officially approved and materials are now being prepared at the workbench.',
      image: null,
      createdAt: new Date(),
    })

    await order.save()

    await createNotification({
      userId: order.buyerId,
      actorId: sellerId,
      type: 'order',
      text: `Your order "${order.title}" was accepted`,
      link: 'orders',
    })

    // Send chat system message notification
    let thread = await Thread.findOne({
      participants: { $all: [order.buyerId, order.sellerId], $size: 2 },
    })
    if (thread) {
      const systemMsg = new Message({
        threadId: thread._id,
        senderId: sellerId,
        text: `BESPOKE ORDER ACCEPTED:\n"${order.title}" has been approved! Crafting timeline initiated.`,
        postId: order.postId || null,
        createdAt: new Date(),
      })
      await systemMsg.save()

      thread.lastMessageText = `Bespoke Order Accepted: "${order.title}"`
      thread.lastMessageAt = new Date()
      await thread.save()

      await emitThreadMessage(thread._id, systemMsg._id)
    }

    ok(res, order)
  } catch (err) {
    serverError(res, err)
  }
}

// Update Order Progress (Seller registers crafting timeline updates)
export const updateOrderProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { stage, note, image } = req.body
    const sellerId = req.user?._id

    if (!sellerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    if (!stage || !note) {
      badRequest(res, 'Missing required fields: stage, note')
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (String(order.sellerId) !== String(sellerId)) {
      badRequest(res, 'Unauthorized to modify this order')
      return
    }

    // Set order status to crafting if not already accepted/crafting
    if (order.status === 'accepted') {
      order.status = 'crafting'
    }

    order.currentStage = stage
    order.timeline.push({
      stage,
      note,
      image: image || null,
      createdAt: new Date(),
    })

    await order.save()

    await createNotification({
      userId: order.buyerId,
      actorId: sellerId,
      type: 'order',
      text: `Update on "${order.title}": ${stage}`,
      link: 'orders',
    })

    // Send dynamic progress update notification inside chat thread
    let thread = await Thread.findOne({
      participants: { $all: [order.buyerId, order.sellerId], $size: 2 },
    })
    if (thread) {
      const progressText = `WORKBENCH UPDATE - ${stage.toUpperCase()}:\n${note}`
      const systemMsg = new Message({
        threadId: thread._id,
        senderId: sellerId,
        text: progressText,
        image: image || null,
        postId: order.postId || null,
        createdAt: new Date(),
      })
      await systemMsg.save()

      thread.lastMessageText = `Workbench Update: ${stage}`
      thread.lastMessageAt = new Date()
      await thread.save()

      await emitThreadMessage(thread._id, systemMsg._id)
    }

    ok(res, order)
  } catch (err) {
    serverError(res, err)
  }
}

// Cancel Order
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const currentUserId = req.user?._id

    if (!currentUserId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (String(order.buyerId) !== String(currentUserId) && String(order.sellerId) !== String(currentUserId)) {
      badRequest(res, 'Unauthorized to modify this order')
      return
    }

    order.status = 'cancelled'
    order.currentStage = 'Order Cancelled'
    order.timeline.push({
      stage: 'Order Cancelled',
      note: 'This bespoke jewelry commission order has been cancelled by one of the co-creation partners.',
      image: null,
      createdAt: new Date(),
    })

    await order.save()

    const cancelRecipient = String(order.buyerId) === String(currentUserId) ? order.sellerId : order.buyerId
    await createNotification({
      userId: cancelRecipient,
      actorId: currentUserId,
      type: 'order',
      text: `Order "${order.title}" was cancelled`,
      link: 'orders',
    })

    // Send chat notification
    let thread = await Thread.findOne({
      participants: { $all: [order.buyerId, order.sellerId], $size: 2 },
    })
    if (thread) {
      const systemMsg = new Message({
        threadId: thread._id,
        senderId: currentUserId,
        text: `BESPOKE ORDER CANCELLED:\n"${order.title}" order has been cancelled.`,
        postId: order.postId || null,
        createdAt: new Date(),
      })
      await systemMsg.save()

      thread.lastMessageText = `Bespoke Order Cancelled: "${order.title}"`
      thread.lastMessageAt = new Date()
      await thread.save()

      await emitThreadMessage(thread._id, systemMsg._id)
    }

    ok(res, order)
  } catch (err) {
    serverError(res, err)
  }
}

// Confirm Delivery Receipt (Buyer confirms receipt of order)
export const confirmReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { received } = req.body // boolean
    const buyerId = req.user?._id

    if (!buyerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (String(order.buyerId) !== String(buyerId)) {
      badRequest(res, 'Unauthorized to modify this order')
      return
    }

    if (received) {
      order.status = 'completed'
      order.currentStage = 'Delivered'
      order.timeline.push({
        stage: 'Delivered',
        note: 'Buyer confirmed receipt of the bespoke jewelry product.',
        image: null,
        createdAt: new Date(),
      })
    } else {
      order.currentStage = 'Delivery Issue Reported'
      order.timeline.push({
        stage: 'Delivery Issue Reported',
        note: 'The buyer reported that they have not received the product yet.',
        image: null,
        createdAt: new Date(),
      })
    }

    await order.save()

    await createNotification({
      userId: order.sellerId,
      actorId: buyerId,
      type: 'order',
      text: received
        ? `Buyer confirmed delivery of "${order.title}"`
        : `Buyer reported a delivery issue for "${order.title}"`,
      link: 'orders',
    })

    if (!received) {
      await notifyAdmins({
        actorId: buyerId,
        type: 'system',
        text: `New delivery dispute reported for order "${order.title}"`,
        link: '/admin/disputes'
      })
    }

    // Send chat notification
    let thread = await Thread.findOne({
      participants: { $all: [order.buyerId, order.sellerId], $size: 2 },
    })
    if (thread) {
      const textMessage = received
        ? `DELIVERY CONFIRMED:\nThe buyer has confirmed that they received their bespoke product for "${order.title}".`
        : `DELIVERY ISSUE REPORTED:\nThe buyer has reported that they have NOT received their bespoke product for "${order.title}" yet.`

      const systemMsg = new Message({
        threadId: thread._id,
        senderId: buyerId,
        text: textMessage,
        postId: order.postId || null,
        createdAt: new Date(),
      })
      await systemMsg.save()

      thread.lastMessageText = received
        ? `Delivery Confirmed: "${order.title}"`
        : `Delivery Issue: "${order.title}"`
      thread.lastMessageAt = new Date()
      await thread.save()

      await emitThreadMessage(thread._id, systemMsg._id)
    }

    ok(res, order)
  } catch (err) {
    serverError(res, err)
  }
}

// Create Review (Buyer reviews a completed order)
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { rating, comment, images } = req.body
    const buyerId = req.user?._id

    if (!buyerId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const numericRating = Number(rating)
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      badRequest(res, 'Rating must be a whole number between 1 and 5')
      return
    }

    if (
      images !== undefined &&
      (!Array.isArray(images) || images.length > 4 || images.some((img: any) => typeof img !== 'string'))
    ) {
      badRequest(res, 'Images must be an array of up to 4 image URLs')
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (String(order.buyerId) !== String(buyerId)) {
      badRequest(res, 'Unauthorized to review this order')
      return
    }

    if (order.status !== 'completed') {
      badRequest(res, 'You can only review completed orders')
      return
    }

    const existing = await Review.findOne({ orderId: order._id })
    if (existing) {
      badRequest(res, 'This order has already been reviewed')
      return
    }

    const review = new Review({
      orderId: order._id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      rating: numericRating,
      comment: typeof comment === 'string' ? comment.trim() : '',
      images: images || [],
    })
    await review.save()

    await createNotification({
      userId: order.sellerId,
      actorId: order.buyerId,
      type: 'review',
      text: `You received a ${numericRating}-star review`,
      link: 'orders',
    })

    created(res, review, 'Review submitted')
  } catch (err) {
    serverError(res, err)
  }
}

// Get Review for an order (Buyer or Seller of that order)
export const getOrderReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      badRequest(res, 'Unauthorized')
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (String(order.buyerId) !== String(userId) && String(order.sellerId) !== String(userId)) {
      badRequest(res, 'Unauthorized to view this review')
      return
    }

    const review = await Review.findOne({ orderId: order._id }).populate(
      'buyerId',
      'firstName lastName avatar'
    )
    ok(res, review)
  } catch (err) {
    serverError(res, err)
  }
}

// Get all public reviews for a post (via orders placed on that post)
export const getPostReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const orders = await Order.find({ postId: id }).select('_id')
    const orderIds = orders.map((o) => o._id)

    const reviews = await Review.find({ orderId: { $in: orderIds } })
      .populate('buyerId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })

    const count = reviews.length
    const averageRating = count
      ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count) * 10) / 10
      : 0

    ok(res, { reviews, averageRating, count })
  } catch (err) {
    serverError(res, err)
  }
}
