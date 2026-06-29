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

export const findWithPasswordById = async (id: string): Promise<IUser | null> => {
  return User.findById(id)
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
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    avatar?: string | null
    location?: string | null
    bio?: string | null
    studioName?: string | null
    studioSpecialty?: string | null
    averageResponseTime?: string | null
    onboarded?: boolean
    interests?: string[]
  }
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  ).select('-passwordHash')
}