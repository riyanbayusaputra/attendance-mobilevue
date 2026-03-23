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
  const EAR_THRESHOLD = 0.22

  function calculateEAR(eye: faceapi.Point[]): number {
    // FIX: optional chaining pada semua akses index array
    const p1 = eye[1]
    const p2 = eye[2]
    const p3 = eye[3]
    const p4 = eye[4]
    const p5 = eye[5]
    const p0 = eye[0]

    if (!p0 || !p1 || !p2 || !p3 || !p4 || !p5) return 1

    const v1 = Math.hypot(p1.x - p5.x, p1.y - p5.y)
    const v2 = Math.hypot(p2.x - p4.x, p2.y - p4.y)
    const h  = Math.hypot(p0.x - p3.x, p0.y - p3.y)

    if (h === 0) return 1

    return (v1 + v2) / (2.0 * h)
  }

  async function checkLiveness(
    videoEl: HTMLVideoElement,
    durationMs = 6000
  ): Promise<LivenessResult> {
    isChecking.value = true
    blinkCount.value = 0
    result.value = null

    let eyeWasClosed = false
    const startTime = Date.now()

    return new Promise((resolve) => {
      const interval = setInterval(async () => {

        if (Date.now() - startTime > durationMs) {
          clearInterval(interval)
          isChecking.value = false

          const passed = blinkCount.value >= 1
          result.value = {
            passed,
            message: passed
              ? 'Liveness terdeteksi!'
              : 'Kedipan mata tidak terdeteksi. Coba lagi.',
          }
          resolve(result.value)
          return
        }

        try {
          const detection = await faceapi
            .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()

          if (!detection) return

          const landmarks = detection.landmarks
          const leftEye  = landmarks.getLeftEye()
          const rightEye = landmarks.getRightEye()

          // Pastikan array eye punya cukup point
          if (leftEye.length < 6 || rightEye.length < 6) return

          const leftEAR  = calculateEAR(leftEye)
          const rightEAR = calculateEAR(rightEye)
          const avgEAR   = (leftEAR + rightEAR) / 2

          if (avgEAR < EAR_THRESHOLD) {
            eyeWasClosed = true
          } else if (eyeWasClosed) {
            blinkCount.value++
            eyeWasClosed = false
          }

        } catch {
          // skip frame error
        }
      }, 100)
    })
  }

  return { isChecking, result, blinkCount, checkLiveness }
}