<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { usePresenceStore } from '@/stores/presence.store'

const route   = useRoute()
const router  = useRouter()
const presence = usePresenceStore()

const checkInType = computed(() =>
  presence.todayPresence?.check_in_at && !presence.todayPresence?.check_out_at
    ? 'out' : 'in'
)

const navItems = [
  {
    name: 'home',
    label: 'Beranda',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>`,
  },
  {
    name: 'report',
    label: 'Laporan',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>`,
  },
  {
    name: 'history',
    label: 'Riwayat',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
  },
]

const isActive = (name: string) => route.name === name
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
    <div class="relative bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">

      <!-- Presensi FAB button -->
      <div class="absolute -top-7 left-1/2 -translate-x-1/2">
        <button
          @click="router.push({ name: 'check-in', query: { type: checkInType } })"
          class="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95"
          :class="isActive('check-in')
            ? 'bg-violet-700 shadow-violet-500/50'
            : 'bg-violet-600 shadow-violet-500/40 hover:bg-violet-700'"
        >
          <!-- Pulse ring saat aktif -->
          <span v-if="isActive('check-in')"
            class="absolute inset-0 rounded-2xl bg-violet-400 animate-ping opacity-20">
          </span>
          <svg class="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
        </button>
        <!-- Label bawah FAB -->
        <p class="text-center text-xs font-medium mt-1"
          :class="isActive('check-in') ? 'text-violet-600' : 'text-gray-400'">
          Presensi
        </p>
      </div>

      <!-- Nav items -->
      <div class="flex items-center h-16 px-2">

        <!-- Kiri: Beranda & Laporan -->
        <div class="flex flex-1 items-center justify-around">
          <router-link
            v-for="item in navItems.slice(0, 2)"
            :key="item.name"
            :to="{ name: item.name }"
            class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 min-w-[60px]"
          >
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              :class="isActive(item.name) ? 'bg-violet-100' : 'bg-transparent'"
            >
              <span
                class="w-5 h-5"
                :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
                v-html="item.icon"
              />
            </div>
            <span
              class="text-xs font-medium leading-none"
              :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
            >
              {{ item.label }}
            </span>
            <!-- Active dot -->
            <div
              v-if="isActive(item.name)"
              class="w-1 h-1 rounded-full bg-violet-600"
            />
            <div v-else class="w-1 h-1" />
          </router-link>
        </div>

        <!-- Tengah: spacer untuk FAB -->
        <div class="w-16 flex-shrink-0"></div>

        <!-- Kanan: Riwayat -->
        <div class="flex flex-1 items-center justify-around">
          <router-link
            v-for="item in navItems.slice(2)"
            :key="item.name"
            :to="{ name: item.name }"
            class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 min-w-[60px]"
          >
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              :class="isActive(item.name) ? 'bg-violet-100' : 'bg-transparent'"
            >
              <span
                class="w-5 h-5"
                :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
                v-html="item.icon"
              />
            </div>
            <span
              class="text-xs font-medium leading-none"
              :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
            >
              {{ item.label }}
            </span>
            <div
              v-if="isActive(item.name)"
              class="w-1 h-1 rounded-full bg-violet-600"
            />
            <div v-else class="w-1 h-1" />
          </router-link>
        </div>

      </div>

      <!-- Safe area iOS -->
      <div class="h-safe-area-inset-bottom bg-white"></div>
    </div>
  </nav>
</template>