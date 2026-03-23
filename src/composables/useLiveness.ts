import * as faceapi from 'face-api.js'
import { ref } from 'vue'

export interface LivenessResult {
  passed: boolean
  message: string
}

export function useLiveness() {
  const isChecking = ref(false)
  const result = ref<LivenessResult | null>(null)
  const blinkCount = ref(0)
  const scanProgress = ref(0) // progress 0-100

  async function checkLiveness(
    videoEl: HTMLVideoElement,
    durationMs = 3000 // ← lebih cepat, 3 detik
  ): Promise<LivenessResult> {
    isChecking.value = true
    blinkCount.value = 0
    scanProgress.value = 0
    result.value = null

    const startTime = Date.now()
    let faceDetectedCount = 0
    const requiredDetections = 5 // wajah harus terdeteksi minimal 5 frame

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const elapsed = Date.now() - startTime
        scanProgress.value = Math.min(100, (elapsed / durationMs) * 100)

        // Timeout
        if (elapsed > durationMs) {
          clearInterval(interval)
          isChecking.value = false

          const passed = faceDetectedCount >= requiredDetections
          result.value = {
            passed,
            message: passed
              ? 'Wajah terdeteksi!'
              : 'Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.',
          }
          resolve(result.value)
          return
        }

        try {
          const detection = await faceapi
            .detectSingleFace(
              videoEl,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 160,
                scoreThreshold: 0.3,
              })
            )

          if (detection) {
            faceDetectedCount++
            console.log(`Wajah terdeteksi: ${faceDetectedCount}/${requiredDetections}`)
          }

          // Kalau sudah cukup deteksi sebelum timeout — langsung lulus
          if (faceDetectedCount >= requiredDetections) {
            clearInterval(interval)
            isChecking.value = false
            scanProgress.value = 100

            result.value = {
              passed: true,
              message: 'Wajah terdeteksi!',
            }
            resolve(result.value)
          }

        } catch {
          // skip frame error
        }
      }, 100)
    })
  }

  return { isChecking, result, blinkCount, scanProgress, checkLiveness }
}