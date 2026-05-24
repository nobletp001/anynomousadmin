import { apiClient } from './api-client'

export interface AdminUser {
  id: number
  name: string
  username: string
  email: string
  role: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: AdminUser
  }
}

export interface MeResponse {
  success: boolean
  data: {
    user: AdminUser
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', { email, password }) as any
  },

  getMe: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>('/auth/me') as any
  },
}
