import nodemailer from 'nodemailer'
import { env } from '../config/env'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (process.env.NODE_ENV === 'test') {
    return
  }
  const mailOptions = {
    from: `Moonstella <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
  }
  await transporter.sendMail(mailOptions)
}
