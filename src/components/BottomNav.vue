<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  {
    name: 'home',
    label: 'Beranda',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>`,
  },
  {
    name: 'check-in',
    label: 'Presensi',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>`,
  },
  {
    name: 'history',
    label: 'Riwayat',
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
  },
]

const isActive = (name: string) => route.name === name
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">

    <!-- Blur background -->
    <div class="bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 pb-safe">
      <div class="flex items-center justify-around h-16">

        <template v-for="item in navItems" :key="item.name">

          <!-- Tombol presensi tengah — lebih besar -->
          <router-link
            v-if="item.name === 'check-in'"
            :to="{ name: 'check-in', query: { type: 'in' } }"
            class="relative -mt-8 flex flex-col items-center"
          >
            <div
              :class="[
                'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200',
                isActive(item.name)
                  ? 'bg-violet-600 shadow-violet-500/40 scale-105'
                  : 'bg-violet-600 shadow-violet-500/30',
              ]"
            >
              <span class="w-6 h-6 text-white" v-html="item.icon" />
            </div>
            <span class="text-xs mt-1.5 font-medium text-violet-600">
              {{ item.label }}
            </span>
          </router-link>

          <!-- Tombol biasa -->
          <router-link
            v-else
            :to="{ name: item.name }"
            class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 group"
            :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
          >
            <!-- Icon container -->
            <div
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                isActive(item.name)
                  ? 'bg-violet-100'
                  : 'group-active:bg-gray-100',
              ]"
            >
              <span
                class="w-5 h-5 transition-all duration-200"
                :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
                v-html="item.icon"
              />
            </div>
            <span
              class="text-xs font-medium transition-all duration-200"
              :class="isActive(item.name) ? 'text-violet-600' : 'text-gray-400'"
            >
              {{ item.label }}
            </span>

            <!-- Active dot indicator -->
            <div
              v-if="isActive(item.name)"
              class="w-1 h-1 rounded-full bg-violet-600 -mt-0.5"
            />
          </router-link>

        </template>

      </div>
    </div>

  </nav>
</template>