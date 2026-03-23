import type { LoginPayload, User } from '@/types'
import api from './api'

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: User }> {
    const { data } = await api.post('/login', payload)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },

  async me(): Promise<{ user: User }> {
    const { data } = await api.get('/me')
    return data
  },
}