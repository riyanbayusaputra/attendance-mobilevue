<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { usePresenceStore } from '@/stores/presence.store'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const presence = usePresenceStore()
const router = useRouter()

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const hasCheckedIn = computed(() => !!presence.todayPresence?.check_in_at)
const hasCheckedOut = computed(() => !!presence.todayPresence?.check_out_at)

const statusMap: Record<string, { label: string; class: string }> = {
  present: { label: 'Hadir', class: 'bg-green-100 text-green-700' },
  late:    { label: 'Terlambat', class: 'bg-yellow-100 text-yellow-700' },
  absent:  { label: 'Tidak Hadir', class: 'bg-red-100 text-red-700' },
}

const statusConfig = computed(() => {
  const status = presence.todayPresence?.status
  if (!status) return null
  return statusMap[status] ?? null
})

function formatTime(datetime: string | null): string {
  if (!datetime) return '--:--'
  return new Date(datetime).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}

onMounted(() => presence.fetchToday())
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">

    <!-- Header -->
    <div class="bg-violet-600 pt-12 pb-20 px-4">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-violet-200 text-xs mb-0.5">Selamat datang,</p>
          <h1 class="text-white font-semibold text-xl">{{ auth.user?.name }}</h1>
          <p class="text-violet-300 text-xs mt-1 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            {{ auth.user?.company?.name ?? 'Tidak ada perusahaan' }}
          </p>
        </div>
        <button
          @click="handleLogout"
          class="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>

    <div class="px-4 -mt-14 space-y-4">

      <!-- Presensi Card -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">

        <!-- Tanggal & Status -->
        <div class="px-5 pt-5 pb-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <p class="text-gray-500 text-xs">{{ today }}</p>
            <span
              v-if="statusConfig"
              :class="['text-xs font-medium px-2.5 py-1 rounded-full', statusConfig.class]"
            >
              {{ statusConfig.label }}
            </span>
            <span v-else class="text-xs text-gray-300">Belum presensi</span>
          </div>
        </div>

        <!-- Times -->
        <div class="grid grid-cols-2 divide-x divide-gray-100">
          <div class="p-5 text-center">
            <p class="text-xs text-gray-400 mb-1">Check In</p>
            <p class="text-2xl font-semibold"
              :class="hasCheckedIn ? 'text-green-600' : 'text-gray-200'">
              {{ formatTime(presence.todayPresence?.check_in_at ?? null) }}
            </p>
            <div v-if="presence.todayPresence?.is_within_radius"
              class="mt-1.5 text-xs text-green-500 flex items-center justify-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
              Dalam radius
            </div>
            <p v-else-if="hasCheckedIn" class="mt-1 text-xs text-red-400">Di luar radius</p>
          </div>

          <div class="p-5 text-center">
            <p class="text-xs text-gray-400 mb-1">Check Out</p>
            <p class="text-2xl font-semibold"
              :class="hasCheckedOut ? 'text-blue-600' : 'text-gray-200'">
              {{ formatTime(presence.todayPresence?.check_out_at ?? null) }}
            </p>
          </div>
        </div>

        <!-- Status Banner -->
        <div class="px-5 pb-5 pt-2">
          <div v-if="!hasCheckedIn"
            class="w-full py-3 bg-violet-50 border border-violet-100 text-violet-600 rounded-xl text-sm text-center font-medium">
            Tap ikon kamera di bawah untuk Check In
          </div>
          <div v-else-if="!hasCheckedOut"
            class="w-full py-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-sm text-center font-medium">
            Tap ikon kamera di bawah untuk Check Out
          </div>
          <div v-else
            class="w-full py-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm text-center flex items-center justify-center gap-2 font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Presensi Selesai
          </div>
        </div>
      </div>

      <!-- Fake GPS Warning -->
      <div v-if="presence.todayPresence?.is_fake_gps"
        class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
        </div>
        <div>
          <p class="text-red-700 text-sm font-medium">Fake GPS Terdeteksi</p>
          <p class="text-red-400 text-xs mt-0.5">Presensi ini telah ditandai oleh sistem</p>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-800 truncate">{{ auth.user?.name }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ auth.user?.employee_id ?? '-' }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-800 truncate">
            {{ auth.user?.company?.name ?? '-' }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">Perusahaan</p>
        </div>
      </div>

    </div>
  </div>
</template>