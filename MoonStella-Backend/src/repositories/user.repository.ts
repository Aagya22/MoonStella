import { User, IUser } from '../models/user.model'

export const findByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email })
}

export const findByPhoneNumber = async (phoneNumber: string): Promise<IUser | null> => {
  return User.findOne({ phoneNumber })
}

export const findById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).select('-passwordHash')
}

export const createUser = async (data: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  passwordHash: string
  role: 'buyer' | 'seller'
}): Promise<IUser> => {
  return User.create(data)
}

export const updateUserProfile = async (
  id: string,
  data: {
    avatar?: string | null
    location?: string | null
    studioName?: string | null
  }
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  ).select('-passwordHash')
}