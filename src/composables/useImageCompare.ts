import * as faceapi from 'face-api.js'
import { ref } from 'vue'

export interface CompareResult {
  match: boolean
  distance: number
  message: string
}

export function useImageCompare() {
  const isComparing = ref(false)
  const lastDistance = ref<number | null>(null)
  const THRESHOLD = 0.5

  async function getDescriptorFromUrl(
    imageUrl: string
  ): Promise<Float32Array | null> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor()
          resolve(detection?.descriptor ?? null)
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = imageUrl
    })
  }

  async function getDescriptorFromVideo(
    videoEl: HTMLVideoElement
  ): Promise<Float32Array | null> {
    try {
      const detection = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
      return detection?.descriptor ?? null
    } catch {
      return null
    }
  }

  async function compare(
    videoEl: HTMLVideoElement,
    profileImageUrl: string
  ): Promise<CompareResult> {
    isComparing.value = true
    lastDistance.value = null

    try {
      const [liveDescriptor, profileDescriptor] = await Promise.all([
        getDescriptorFromVideo(videoEl),
        getDescriptorFromUrl(profileImageUrl),
      ])

      // Wajah tidak terdeteksi di kamera
      if (!liveDescriptor) {
        return {
          match: false,
          distance: 1,
          message: 'Wajah tidak terdeteksi di kamera. Pastikan wajah terlihat jelas.',
        }
      }

      // Foto profil tidak ada wajah — skip validasi
      if (!profileDescriptor) {
        return {
          match: true,
          distance: 0,
          message: 'Foto profil belum tersedia, validasi dilewati.',
        }
      }

      const distance = faceapi.euclideanDistance(liveDescriptor, profileDescriptor)
      lastDistance.value = distance
      const match = distance <= THRESHOLD
      const pct = ((1 - distance) * 100).toFixed(0)

      return {
        match,
        distance,
        message: match
          ? `Wajah cocok (${pct}% kemiripan)`
          : `Wajah tidak cocok. Pastikan Anda karyawan yang terdaftar.`,
      }
    } finally {
      isComparing.value = false
    }
  }

  return { isComparing, lastDistance, compare }
}