<script setup lang="ts">
import type { Presence } from '@/types'
import { usePresenceStore } from '@/stores/presence.store'
import { onMounted } from 'vue'

const presence = usePresenceStore()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric',
  })
}

function formatTime(datetime: string | null): string {
  if (!datetime) return '--:--'
  return new Date(datetime).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  })
}

function getDuration(item: Presence): string {
  if (!item.check_in_at || !item.check_out_at) return '-'
  const ms = new Date(item.check_out_at).getTime() - new Date(item.check_in_at).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}j ${m}m`
}

const statusConfig: Record<string, { label: string; class: string }> = {
  present: { label: 'Hadir', class: 'bg-green-100 text-green-700' },
  late:    { label: 'Terlambat', class: 'bg-yellow-100 text-yellow-700' },
  absent:  { label: 'Tidak Hadir', class: 'bg-red-100 text-red-700' },
}

onMounted(() => presence.fetchHistory())
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">

    <!-- Header -->
    <div class="bg-violet-600 pt-12 pb-6 px-4">
      <h1 class="text-white font-semibold text-lg">Riwayat Presensi</h1>
      <p class="text-violet-200 text-xs mt-0.5">
        {{ presence.history.length }} data ditemukan
      </p>
    </div>

    <div class="px-4 py-4 space-y-3">

      <!-- Loading skeleton -->
      <template v-if="presence.loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-4 animate-pulse">
          <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="h-16 bg-gray-100 rounded-xl"></div>
            <div class="h-16 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else-if="!presence.history.length" class="text-center py-20">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-500 text-sm font-medium">Belum ada riwayat</p>
        <p class="text-gray-400 text-xs mt-1">Lakukan check in untuk memulai</p>
      </div>

      <!-- List -->
      <template v-else>
        <div v-for="item in presence.history" :key="item.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden">

          <div class="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ formatDate(item.date) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['text-xs font-medium px-2 py-0.5 rounded-full',
                  statusConfig[item.status]?.class ?? 'bg-gray-100 text-gray-500']">
                  {{ statusConfig[item.status]?.label ?? item.status }}
                </span>
                <span v-if="item.is_fake_gps"
                  class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  Fake GPS
                </span>
              </div>
            </div>
            <div v-if="item.check_in_at && item.check_out_at" class="text-right">
              <p class="text-xs text-gray-400">Durasi</p>
              <p class="text-sm font-semibold text-violet-600">{{ getDuration(item) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 divide-x divide-gray-50">
            <div class="p-4">
              <p class="text-xs text-gray-400 mb-1">Check In</p>
              <p class="text-lg font-semibold"
                :class="item.check_in_at ? 'text-green-600' : 'text-gray-300'">
                {{ formatTime(item.check_in_at) }}
              </p>
              <p class="text-xs mt-1"
                :class="item.is_within_radius ? 'text-green-500' : 'text-red-400'">
                {{ item.is_within_radius ? '✓ Dalam radius' : '✗ Luar radius' }}
              </p>
            </div>
            <div class="p-4">
              <p class="text-xs text-gray-400 mb-1">Check Out</p>
              <p class="text-lg font-semibold"
                :class="item.check_out_at ? 'text-blue-600' : 'text-gray-300'">
                {{ formatTime(item.check_out_at) }}
              </p>
            </div>
          </div>

        </div>
      </template>

    </div>
  </div>
</template>