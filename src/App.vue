<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import BottomNav from '@/components/BottomNav.vue'

const auth = useAuthStore()
const route = useRoute()

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
    <RouterView v-slot="{ Component }">
      <keep-alive include="HomeView,HistoryView">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
    <BottomNav v-if="!hideNav && auth.isLoggedIn" />
  </div>
</template>