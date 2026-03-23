import { authService } from '@/services/auth.service'
import type { LoginPayload, User } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(payload)
      token.value = res.token
      user.value = res.user
      localStorage.setItem('auth_token', res.token)
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? 'Login gagal. Coba lagi.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // tetap logout meski request gagal
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
    }
  }

  async function fetchMe() {
    try {
      const res = await authService.me()
      user.value = res.user
    } catch {
      await logout()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    login,
    logout,
    fetchMe,
  }
})