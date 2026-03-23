<script setup lang="ts">
import { useCamera } from '@/composables/useCamera'
import { useFaceApi } from '@/composables/useFaceApi'
import { useFakeGPSDetect } from '@/composables/useFakeGPSDetect'
import { useImageCompare } from '@/composables/useImageCompare'
import { useLiveness } from '@/composables/useLiveness'
import { useGPS } from '@/composables/useGPS'
import { useAuthStore } from '@/stores/auth.store'
import { usePresenceStore } from '@/stores/presence.store'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route    = useRoute()
const router   = useRouter()
const auth     = useAuthStore()
const presence = usePresenceStore()

const type  = computed(() => route.query.type === 'out' ? 'out' : 'in')
const title = computed(() => type.value === 'in' ? 'Check In' : 'Check Out')

type Step =
  | 'loading-model'
  | 'liveness'
  | 'camera'
  | 'preview'
  | 'processing'
  | 'success'
  | 'error'

const step          = ref<Step>('loading-model')
const errorMsg      = ref<string | null>(null)
const statusText    = ref('Memuat model AI...')
const capturedPhoto = ref<string | null>(null)
const videoRef      = ref<HTMLVideoElement | null>(null)

const faceApi      = useFaceApi()
const liveness     = useLiveness()
const imageCompare = useImageCompare()
const camera       = useCamera()
const gps          = useGPS()
const fakeGPS      = useFakeGPSDetect()

onMounted(async () => {
  // Step 1 — load model AI
  step.value = 'loading-model'
  statusText.value = 'Memuat model AI...'
  await faceApi.loadModels()

  if (faceApi.error.value) {
    errorMsg.value = faceApi.error.value
    step.value = 'error'
    return
  }

  // Step 2 — start kamera
  await camera.startCamera(videoRef.value!)

  if (camera.error.value) {
    errorMsg.value = camera.error.value
    step.value = 'error'
    return
  }

  // Step 3 — liveness detection
  await runLiveness()
})

onUnmounted(() => camera.stopCamera())

async function runLiveness() {
  step.value = 'liveness'
  statusText.value = 'Kedipkan mata Anda...'

  const result = await liveness.checkLiveness(videoRef.value!, 6000)

  if (!result.passed) {
    errorMsg.value = result.message
    step.value = 'error'
    return
  }

  step.value = 'camera'
}

async function capture() {
  if (!videoRef.value || !camera.isReady.value) return

  step.value = 'processing'
  statusText.value = 'Memverifikasi wajah...'
  errorMsg.value = null

  const profilePhoto = auth.user?.photo
  console.log('=== CAPTURE START ===')
  console.log('Profile photo URL:', profilePhoto)

  // Wajib ada foto profil
  if (!profilePhoto) {
    errorMsg.value = 'Foto profil belum diupload. Hubungi administrator.'
    step.value = 'error'
    return
  }

  // Jalankan image comparison
  const result = await imageCompare.compare(videoRef.value!, profilePhoto)
  console.log('Compare result:', result)

  // STOP kalau tidak cocok
  if (!result.match) {
    errorMsg.value = result.message
    step.value = 'error'
    return
  }

  // Lanjut hanya kalau cocok
  console.log('✓ Wajah cocok, lanjut capture')
  capturedPhoto.value = camera.capturePhoto(videoRef.value!)
  step.value = 'preview'
}

async function retake() {
  capturedPhoto.value = null
  errorMsg.value = null
  await runLiveness()
}

async function submit() {
  if (!capturedPhoto.value) return

  step.value = 'processing'
  statusText.value = 'Mengambil lokasi GPS...'
  errorMsg.value = null

  try {
    const coords = await gps.getCurrentPosition()
    statusText.value = 'Mengirim data...'
    const isFake = fakeGPS.detect(coords)

    if (type.value === 'in') {
      await presence.doCheckIn({
        latitude:    coords.latitude,
        longitude:   coords.longitude,
        photo:       capturedPhoto.value,
        is_fake_gps: isFake,
      })
    } else {
      await presence.doCheckOut({
        latitude:  coords.latitude,
        longitude: coords.longitude,
        photo:     capturedPhoto.value,
      })
    }

    step.value = 'success'

    // Refresh data home
    await Promise.all([
      presence.fetchToday(),
      auth.fetchMe(),
    ])

    setTimeout(() => router.push({ name: 'home' }), 2000)

  } catch (err: any) {
    errorMsg.value =
      err.response?.data?.message ?? err.message ?? 'Terjadi kesalahan.'
    step.value = 'preview'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col select-none">

    <!-- Header -->
    <div class="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0">
      <button
        @click="router.back()"
        class="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
      >
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div>
        <h1 class="text-white font-semibold text-lg">{{ title }}</h1>
        <p class="text-gray-400 text-xs">{{ auth.user?.name }}</p>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center px-4 gap-5 pb-8">

      <!-- Camera Circle -->
      <div
        class="relative w-72 h-72 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 transition-all duration-500"
        :class="{
          'ring-4 ring-violet-500/40': step === 'loading-model',
          'ring-4 ring-yellow-400/60': step === 'liveness',
          'ring-4 ring-violet-500/60': step === 'camera',
          'ring-4 ring-green-500/60':  step === 'preview' || step === 'success',
          'ring-4 ring-red-500/60':    step === 'error',
          'ring-4 ring-blue-500/40':   step === 'processing',
        }"
      >
        <!-- Video stream -->
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover scale-x-[-1]"
          :class="{ 'opacity-0': step === 'preview' || step === 'success' || step === 'error' }"
        />

        <!-- Preview foto -->
        <img
          v-if="capturedPhoto && (step === 'preview' || step === 'success')"
          :src="capturedPhoto"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <!-- Loading model overlay -->
        <div
          v-if="step === 'loading-model'"
          class="absolute inset-0 bg-gray-900/70 flex flex-col items-center justify-center gap-3"
        >
          <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white text-xs text-center px-6">Memuat AI Model...</p>
        </div>

        <!-- Liveness overlay -->
        <div v-if="step === 'liveness'" class="absolute inset-0">
          <div class="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            <div class="w-full h-0.5 bg-yellow-400/50 animate-scan"></div>
          </div>
          <div class="absolute bottom-5 left-0 right-0 flex justify-center">
            <div class="bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
              <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <p class="text-yellow-400 text-xs font-medium">
                Kedipan: {{ liveness.blinkCount.value }}x
              </p>
            </div>
          </div>
        </div>

        <!-- Error overlay -->
        <div
          v-if="step === 'error'"
          class="absolute inset-0 bg-gray-900/80 flex items-center justify-center"
        >
          <div class="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
        </div>

        <!-- Success overlay -->
        <div
          v-if="step === 'success'"
          class="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>

      </div>

      <!-- Step indicators -->
      <div class="flex items-center gap-2">
        <div
          v-for="(s, i) in ['loading-model', 'liveness', 'camera', 'preview']"
          :key="i"
          class="h-1 rounded-full transition-all duration-300"
          :class="{
            'w-6 bg-violet-500': step === s,
            'w-2 bg-gray-600': step !== s,
          }"
        ></div>
      </div>

      <!-- Status Text -->
      <div class="w-full max-w-xs text-center min-h-[80px] flex flex-col items-center justify-center">

        <!-- Loading model -->
        <template v-if="step === 'loading-model'">
          <p class="text-white text-sm font-medium">Menyiapkan AI</p>
          <p class="text-gray-500 text-xs mt-1">Harap tunggu sebentar...</p>
        </template>

        <!-- Liveness -->
        <template v-else-if="step === 'liveness'">
          <p class="text-yellow-400 text-sm font-medium">Liveness Detection</p>
          <p class="text-gray-300 text-sm mt-1">Kedipkan mata Anda minimal 1x</p>
          <p class="text-gray-500 text-xs mt-1">dalam 6 detik</p>
          <div class="mt-3 w-48 bg-gray-700 rounded-full h-1 overflow-hidden">
            <div class="bg-yellow-400 h-1 rounded-full animate-progress"></div>
          </div>
        </template>

        <!-- Camera ready -->
        <template v-else-if="step === 'camera'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <p class="text-green-400 text-sm font-medium">Liveness OK</p>
          </div>
          <p class="text-gray-300 text-sm">Posisikan wajah & ambil foto</p>
          <p class="text-gray-500 text-xs mt-1">Pastikan pencahayaan cukup</p>
        </template>

        <!-- Preview -->
        <template v-else-if="step === 'preview'">
          <p class="text-white text-sm font-medium">Foto siap dikirim</p>
          <p class="text-gray-400 text-xs mt-1">Pastikan wajah terlihat jelas</p>
        </template>

        <!-- Processing -->
        <template v-else-if="step === 'processing'">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-violet-400 text-sm font-medium">{{ statusText }}</p>
          </div>
        </template>

        <!-- Success -->
        <template v-else-if="step === 'success'">
          <p class="text-green-400 font-semibold text-xl">{{ title }} Berhasil!</p>
          <p class="text-gray-400 text-sm mt-1">Kembali ke dashboard...</p>
        </template>

        <!-- Error -->
        <template v-else-if="step === 'error'">
          <p class="text-red-400 text-sm font-medium text-center px-2">{{ errorMsg }}</p>
          <button
            @click="retake"
            class="mt-3 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition active:scale-95"
          >
            Coba Lagi
          </button>
        </template>

      </div>

      <!-- Action Buttons -->
      <div class="w-full max-w-xs mt-auto">

        <!-- Tombol ambil foto -->
        <div v-if="step === 'camera'" class="flex justify-center">
          <button
            @click="capture"
            :disabled="!camera.isReady.value || imageCompare.isComparing.value"
            class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform disabled:opacity-40"
          >
            <div class="w-14 h-14 bg-violet-600 rounded-full"></div>
          </button>
        </div>

        <!-- Tombol preview -->
        <div v-if="step === 'preview'" class="grid grid-cols-2 gap-3">
          <button
            @click="retake"
            class="py-3.5 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-medium rounded-xl transition text-sm"
          >
            Ulangi
          </button>
          <button
            @click="submit"
            :disabled="presence.loading"
            class="py-3.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-violet-400 text-white font-medium rounded-xl transition text-sm"
          >
            <span v-if="presence.loading">Mengirim...</span>
            <span v-else>Submit</span>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0%   { transform: translateY(-4px); }
  100% { transform: translateY(292px); }
}
@keyframes progress {
  0%   { width: 0%; }
  100% { width: 100%; }
}
.animate-scan {
  animation: scan 2s linear infinite;
}
.animate-progress {
  animation: progress 6s linear forwards;
}
</style>