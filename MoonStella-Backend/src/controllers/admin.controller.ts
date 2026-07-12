import type { Request, Response, NextFunction } from 'express'
import { User } from '../models/user.model'
import { Order } from '../models/order.model'
import { Post } from '../models/post.model'
import { createNotification } from '../services/notification.service'
import { ok, badRequest, notFound } from '../utils/response'
import { AppError } from '../errors/app.error'

export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const buyersCount = await User.countDocuments({ role: 'buyer' })
    const sellersCount = await User.countDocuments({ role: 'seller' })
    const ordersCount = await Order.countDocuments({})

    const volumeResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ])
    const totalVolume = volumeResult[0]?.total || 0

    // Activity stream
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyerId sellerId', 'firstName lastName avatar email')

    const recentPosts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName avatar')

    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role isApproved isSuspended createdAt')

    ok(res, {
      stats: {
        buyersCount,
        sellersCount,
        ordersCount,
        totalVolume,
      },
      activities: {
        recentOrders,
        recentPosts,
        recentUsers,
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .select('-passwordHash')
    ok(res, users)
  } catch (err) {
    next(err)
  }
}

export const approveArtisan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      notFound(res, 'Not found')
      return
    }

    if (user.role !== 'seller') {
      badRequest(res, 'Only artisans can be approved')
      return
    }

    user.isApproved = true
    await user.save()

    await createNotification({
      userId: user._id,
      type: 'system',
      text: 'Your artisan account has been approved by the administration! You can now start posting jewelry listings.',
      link: 'profile',
    })

    ok(res, user, 'Artisan approved successfully')
  } catch (err) {
    next(err)
  }
}

export const toggleSuspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      notFound(res, 'Not found')
      return
    }

    user.isSuspended = !user.isSuspended
    await user.save()

    await createNotification({
      userId: user._id,
      type: 'system',
      text: user.isSuspended
        ? 'Your account has been suspended by the administrator for violating platform terms.'
        : 'Your account suspension has been lifted by the administrator.',
      link: '',
    })

    ok(res, user, user.isSuspended ? 'User suspended successfully' : 'User suspension lifted')
  } catch (err) {
    next(err)
  }
}

export const getDisputedOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({
      $or: [
        { currentStage: 'Delivery Issue Reported' },
        { currentStage: 'Delivery Dispute' }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate('buyerId sellerId')
    ok(res, orders)
  } catch (err) {
    next(err)
  }
}

export const resolveDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { action } = req.body // 'complete' or 'refund'
    if (!['complete', 'refund'].includes(action)) {
      badRequest(res, 'Action must be either "complete" or "refund"')
      return
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      notFound(res, 'Not found')
      return
    }

    if (action === 'complete') {
      order.status = 'completed'
      order.currentStage = 'Delivered'
      order.timeline.push({
        stage: 'Delivered',
        note: 'Order dispute resolved by Admin. Delivery verified and payment released.',
        createdAt: new Date()
      })

      await order.save()

      await createNotification({
        userId: order.buyerId,
        type: 'order',
        text: `Admin resolved dispute for your order "${order.title}": Marked as Delivered.`,
        link: 'orders',
      })

      await createNotification({
        userId: order.sellerId,
        type: 'order',
        text: `Admin resolved dispute for your order "${order.title}": Funds released.`,
        link: 'orders',
      })

    } else if (action === 'refund') {
      order.status = 'cancelled'
      order.currentStage = 'Cancelled & Refunded by Admin'
      order.timeline.push({
        stage: 'Cancelled & Refunded by Admin',
        note: 'Order dispute resolved by Admin. Commission cancelled and refunded to buyer.',
        createdAt: new Date()
      })

      await order.save()

      await createNotification({
        userId: order.buyerId,
        type: 'order',
        text: `Admin resolved dispute for your order "${order.title}": Commission cancelled & refunded.`,
        link: 'orders',
      })

      await createNotification({
        userId: order.sellerId,
        type: 'order',
        text: `Admin resolved dispute for your order "${order.title}": Commission cancelled & payment voided.`,
        link: 'orders',
      })
    }

    ok(res, order, `Dispute resolved successfully with action: ${action}`)
  } catch (err) {
    next(err)
  }
}

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar studioName role')
    ok(res, posts)
  } catch (err) {
    next(err)
  }
}

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      notFound(res, 'Not found')
      return
    }

    await Post.findByIdAndDelete(req.params.id)

    await createNotification({
      userId: post.userId,
      type: 'system',
      text: `Your listing post under "${post.category}" has been removed by the administrator for violating terms of service.`,
      link: '',
    })

    ok(res, null, 'Post moderated and deleted successfully')
  } catch (err) {
    next(err)
  }
}
