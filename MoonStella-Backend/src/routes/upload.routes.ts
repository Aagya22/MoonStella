import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import { uploadImage, uploadAudio } from '../controllers/upload.controller'
import multer from 'multer'
import cloudinary from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { env } from '../config/env'

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'moonstella/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto' }],
  } as object,
})

const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'moonstella/voice',
    resource_type: 'video', // Audio files are uploaded as 'video' resource type in Cloudinary
    allowed_formats: ['webm', 'mp3', 'wav', 'ogg', 'm4a'],
  } as object,
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadAudioMiddleware = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

const router = Router()
router.post('/image', protect, upload.single('image'), uploadImage)
router.post('/audio', protect, uploadAudioMiddleware.single('audio'), uploadAudio)

export default router