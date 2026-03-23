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
  const THRESHOLD = 0.45 // ← ketat

  async function getDescriptorFromUrl(
    imageUrl: string
  ): Promise<Float32Array | null> {
    return new Promise((resolve) => {
      // Fetch dengan header ngrok
      fetch(imageUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = async () => {
            try {
              const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor()
              console.log('Profile face detected:', detection ? '✓' : '✗ tidak ada wajah')
              URL.revokeObjectURL(blobUrl)
              resolve(detection?.descriptor ?? null)
            } catch (err) {
              console.error('Detect error:', err)
              URL.revokeObjectURL(blobUrl)
              resolve(null)
            }
          }
          img.onerror = () => {
            console.error('Image load error')
            URL.revokeObjectURL(blobUrl)
            resolve(null)
          }
          img.src = blobUrl
        })
        .catch((err) => {
          console.error('Fetch error:', err)
          resolve(null)
        })
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
      console.log('Live face detected:', detection ? '✓' : '✗ tidak ada wajah di kamera')
      return detection?.descriptor ?? null
    } catch (err) {
      console.error('Live detect error:', err)
      return null
    }
  }

  async function compare(
    videoEl: HTMLVideoElement,
    profileImageUrl: string
  ): Promise<CompareResult> {
    isComparing.value = true
    lastDistance.value = null

    console.log('=== IMAGE COMPARE ===')
    console.log('URL:', profileImageUrl)

    try {
      const [liveDescriptor, profileDescriptor] = await Promise.all([
        getDescriptorFromVideo(videoEl),
        getDescriptorFromUrl(profileImageUrl),
      ])

      console.log('Live descriptor:', liveDescriptor ? '✓' : '✗ NULL')
      console.log('Profile descriptor:', profileDescriptor ? '✓' : '✗ NULL')

      // Wajah tidak terdeteksi di kamera
      if (!liveDescriptor) {
        return {
          match: false,
          distance: 1,
          message: 'Wajah tidak terdeteksi di kamera. Posisikan wajah dengan benar.',
        }
      }

      // Foto profil gagal diproses → TOLAK, jangan skip
      if (!profileDescriptor) {
        return {
          match: false, // ← TOLAK bukan skip
          distance: 1,
          message: 'Gagal memproses foto profil. Hubungi administrator.',
        }
      }

      const distance = faceapi.euclideanDistance(
        Array.from(liveDescriptor),
        Array.from(profileDescriptor)
      )

      lastDistance.value = distance
      const match = distance <= THRESHOLD
      const pct = ((1 - distance) * 100).toFixed(1)

      console.log('Distance:', distance.toFixed(4))
      console.log('Threshold:', THRESHOLD)
      console.log('Match:', match)
      console.log('===================')

      return {
        match,
        distance,
        message: match
          ? `Verifikasi berhasil (${pct}% kemiripan)`
          : `Wajah tidak cocok (${pct}% kemiripan). Absen ditolak.`,
      }
    } finally {
      isComparing.value = false
    }
  }

  return { isComparing, lastDistance, compare }
}