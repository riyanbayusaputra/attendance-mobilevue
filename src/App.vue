<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import BottomNav from '@/components/BottomNav.vue'

const auth = useAuthStore()
const route = useRoute()

// Halaman yang tidak pakai bottom nav
const hideNav = computed(() =>
  ['login', 'check-in'].includes(route.name as string)
)

onMounted(async () => {
  if (auth.isLoggedIn) {
    await auth.fetchMe()
  }
})
</script>

<template>
  <div class="max-w-md mx-auto min-h-screen relative">
    <RouterView />
    <BottomNav v-if="!hideNav && auth.isLoggedIn" />
  </div>
</template>