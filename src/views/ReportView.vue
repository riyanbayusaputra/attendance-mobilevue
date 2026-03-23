<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { presenceService } from '@/services/presence.service'

const loading    = ref(false)
const reportData = ref<any>(null)
const summary    = ref<any>(null)

const currentMonth = ref(new Date().getMonth() + 1)
const currentYear  = ref(new Date().getFullYear())

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const monthLabel = computed(() => months[currentMonth.value - 1])

async function loadReport() {
  loading.value = true
  try {
    const [report, sum] = await Promise.all([
      presenceService.monthlyReport(currentMonth.value, currentYear.value),
      presenceService.summary(),
    ])
    reportData.value = report
    summary.value    = sum
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadReport()
}

function nextMonth() {
  const now = new Date()
  if (
    currentYear.value > now.getFullYear() ||
    (currentYear.value === now.getFullYear() && currentMonth.value >= now.getMonth() + 1)
  ) return
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadReport()
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function formatTime(datetime: string | null): string {
  if (!datetime) return '--:--'
  return new Date(datetime).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  })
}

const statusConfig: Record<string, { label: string; class: string }> = {
  present: { label: 'Hadir', class: 'bg-green-100 text-green-700' },
  late:    { label: 'Terlambat', class: 'bg-yellow-100 text-yellow-700' },
  absent:  { label: 'Tidak Hadir', class: 'bg-red-100 text-red-700' },
}

onMounted(() => loadReport())
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">

    <!-- Header -->
    <div class="bg-violet-600 pt-12 pb-6 px-4">
      <h1 class="text-white font-semibold text-lg">Laporan Presensi</h1>
      <p class="text-violet-200 text-xs mt-0.5">Rekap kehadiran bulanan</p>
    </div>

    <div class="px-4 py-4 space-y-4">

      <!-- Summary Card -->
      <div v-if="summary" class="grid grid-cols-3 gap-2">
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-green-600">{{ summary.total_hadir }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Hadir</p>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-yellow-500">{{ summary.total_terlambat }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Terlambat</p>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-red-500">{{ summary.total_absen }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Absen</p>
        </div>
      </div>

      <!-- Month Selector -->
      <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <button
          @click="prevMonth"
          class="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="text-center">
          <p class="text-base font-semibold text-gray-800">{{ monthLabel }} {{ currentYear }}</p>
          <p v-if="reportData" class="text-xs text-gray-400 mt-0.5">
            {{ reportData.summary.total_hari_kerja }} hari kerja •
            {{ reportData.summary.total_jam_kerja }}
          </p>
        </div>

        <button
          @click="nextMonth"
          class="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Monthly Stats -->
      <div v-if="reportData" class="grid grid-cols-3 gap-2">
        <div class="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
          <p class="text-xl font-bold text-green-600">{{ reportData.summary.total_hadir }}</p>
          <p class="text-xs text-green-500 mt-0.5">Hadir</p>
        </div>
        <div class="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 text-center">
          <p class="text-xl font-bold text-yellow-600">{{ reportData.summary.total_terlambat }}</p>
          <p class="text-xs text-yellow-500 mt-0.5">Terlambat</p>
        </div>
        <div class="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
          <p class="text-xl font-bold text-red-600">{{ reportData.summary.total_absen }}</p>
          <p class="text-xs text-red-500 mt-0.5">Tidak Hadir</p>
        </div>
      </div>

      <!-- Loading -->
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-4 animate-pulse">
          <div class="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="reportData && reportData.data.length === 0"
        class="text-center py-12">
        <div class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-gray-500 text-sm font-medium">Tidak ada data</p>
        <p class="text-gray-400 text-xs mt-1">Bulan {{ monthLabel }} {{ currentYear }}</p>
      </div>

      <!-- List -->
      <template v-else-if="reportData">
        <div v-for="item in reportData.data" :key="item.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden">

          <div class="px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-50">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ formatDate(item.date) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['text-xs font-medium px-2 py-0.5 rounded-full',
                  statusConfig[item.status]?.class ?? 'bg-gray-100 text-gray-500']">
                  {{ statusConfig[item.status]?.label ?? item.status }}
                </span>
                <span v-if="item.is_fake_gps"
                  class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  Fake GPS
                </span>
                <span v-if="!item.is_within_radius && item.check_in_at"
                  class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  Luar Radius
                </span>
              </div>
            </div>
            <div v-if="item.durasi" class="text-right">
              <p class="text-xs text-gray-400">Durasi</p>
              <p class="text-sm font-semibold text-violet-600">{{ item.durasi }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 divide-x divide-gray-50">
            <div class="px-4 py-3">
              <p class="text-xs text-gray-400">Check In</p>
              <p class="text-base font-semibold mt-0.5"
                :class="item.check_in_at ? 'text-green-600' : 'text-gray-300'">
                {{ formatTime(item.check_in_at) }}
              </p>
            </div>
            <div class="px-4 py-3">
              <p class="text-xs text-gray-400">Check Out</p>
              <p class="text-base font-semibold mt-0.5"
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