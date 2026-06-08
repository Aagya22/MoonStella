export type UserRole = 'buyer' | 'seller' | 'admin'

export interface IUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: UserRole
  avatar: string | null
  location: string | null
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: IUser
}