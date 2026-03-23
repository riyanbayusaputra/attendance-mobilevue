import { presenceService } from '@/services/presence.service'
import type { CheckInPayload, CheckOutPayload, Presence } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePresenceStore = defineStore('presence', () => {
  const todayPresence = ref<Presence | null>(null)
  const history = ref<Presence[]>([])
  const currentPage = ref(1)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchToday() {
    loading.value = true
    error.value = null
    try {
      const res = await presenceService.today()
      todayPresence.value = res.presence
    } catch (err: any) {
      error.value = err.response?.data?.message ?? 'Gagal memuat data.'
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory(page = 1) {
    loading.value = true
    error.value = null
    try {
      const res = await presenceService.history(page)
      history.value = res.data
      currentPage.value = res.current_page
      lastPage.value = res.last_page
    } catch (err: any) {
      error.value = err.response?.data?.message ?? 'Gagal memuat riwayat.'
    } finally {
      loading.value = false
    }
  }

  async function doCheckIn(payload: CheckInPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await presenceService.checkIn(payload)
      todayPresence.value = res.presence
      return res
    } catch (err: any) {
      error.value = err.response?.data?.message ?? 'Check in gagal.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function doCheckOut(payload: CheckOutPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await presenceService.checkOut(payload)
      todayPresence.value = res.presence
      return res
    } catch (err: any) {
      error.value = err.response?.data?.message ?? 'Check out gagal.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    todayPresence,
    history,
    currentPage,
    lastPage,
    loading,
    error,
    fetchToday,
    fetchHistory,
    doCheckIn,
    doCheckOut,
  }
})