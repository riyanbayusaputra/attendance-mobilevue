import type {
  CheckInPayload,
  CheckOutPayload,
  PaginatedResponse,
  Presence,
} from '@/types'
import api from './api'

export const presenceService = {
  async today(): Promise<{ presence: Presence | null }> {
    const { data } = await api.get('/presences/today')
    return data
  },

  async history(page = 1): Promise<PaginatedResponse<Presence>> {
    const { data } = await api.get(`/presences/history?page=${page}`)
    return data
  },

  async checkIn(payload: CheckInPayload): Promise<{
    message: string
    presence: Presence
    is_within_radius: boolean
  }> {
    const { data } = await api.post('/presences/check-in', payload)
    return data
  },

  async checkOut(payload: CheckOutPayload): Promise<{
    message: string
    presence: Presence
  }> {
    const { data } = await api.post('/presences/check-out', payload)
    return data
  },
  async monthlyReport(month: number, year: number): Promise<any> {
  const { data } = await api.get(`/report/monthly?month=${month}&year=${year}`)
  return data
},

async summary(): Promise<any> {
  const { data } = await api.get('/report/summary')
  return data
},
}