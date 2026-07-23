import api from './axios'
import { ENDPOINTS } from './endpoints'
import type { AuthResponse } from '@/types/user'

export const loginApi = async (data: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await api.post(ENDPOINTS.auth.login, data)
  return response.data.data
}

export const registerApi = async (data: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  role: 'buyer' | 'seller'
}): Promise<AuthResponse> => {
  const response = await api.post(ENDPOINTS.auth.register, data)
  return response.data.data
}

export const getMeApi = async (): Promise<AuthResponse['user']> => {
  const response = await api.get(ENDPOINTS.auth.me)
  return response.data.data
}

export const updateProfileApi = async (data: {
  avatar?: string | null
  location?: string | null
  studioName?: string | null
  studioSpecialty?: string | null
  averageResponseTime?: string | null
  onboarded?: boolean
  interests?: string[]
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phoneNumber?: string | null
  bio?: string | null
}, token: string): Promise<AuthResponse['user']> => {
  const response = await api.patch(ENDPOINTS.auth.profile, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data.data
}

export const changePasswordApi = async (data: {
  oldPassword: string
  newPassword: string
}, token: string): Promise<any> => {
  const response = await api.patch('/api/auth/change-password', data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  // The old token is now invalid, so store the replacement
  const refreshedToken = response.data?.data?.token
  if (refreshedToken && typeof window !== 'undefined') {
    localStorage.setItem('ms_token', refreshedToken)
  }
  return response.data
}

export const checkUniqueApi = async (data: {
  email: string
  phoneNumber: string
}): Promise<{ unique: boolean }> => {
  const response = await api.post(ENDPOINTS.auth.checkUnique, data)
  return response.data.data
}

export const toggleFollowUserApi = async (id: string, token: string): Promise<any> => {
  const response = await api.post(`/api/auth/follow/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data.data
}

export const forgotPasswordApi = async (data: {
  email: string
}): Promise<any> => {
  const response = await api.post(ENDPOINTS.auth.forgotPassword, data)
  return response.data
}

export const resetPasswordApi = async (data: {
  token: string
  password: string
  confirmPassword: string
}): Promise<any> => {
  const response = await api.post(ENDPOINTS.auth.resetPassword, data)
  return response.data
}