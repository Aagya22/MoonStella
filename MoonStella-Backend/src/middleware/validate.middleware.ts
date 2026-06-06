import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and replace req.body with the validated and transformed data
      // This also strips any extra fields not in the schema
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        // Send the first validation error message
        res.status(400).json({
          success: false,
          message: err.errors[0].message,
          data: null,
        })
        return
      }
      next(err)
    }
  }