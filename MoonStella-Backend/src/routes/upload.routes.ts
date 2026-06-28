import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import { uploadImage } from '../controllers/upload.controller'
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

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
})

const router = Router()
router.post('/image', protect, upload.single('image'), uploadImage)

export default router