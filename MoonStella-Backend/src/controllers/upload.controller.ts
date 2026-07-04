import type { Request, Response, NextFunction } from 'express'
import { ok, serverError } from '../utils/response'

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded', data: null })
      return
    }

    // Cloudinary URL is on req.file.path after multer-storage-cloudinary
    const url = (req.file as any).path

    ok(res, { url }, 'Image uploaded successfully')
  } catch (err) {
    next(err)
  }
}

export const uploadAudio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded', data: null })
      return
    }

    // Cloudinary URL is on req.file.path after multer-storage-cloudinary
    const url = (req.file as any).path

    ok(res, { url }, 'Audio uploaded successfully')
  } catch (err) {
    next(err)
  }
}