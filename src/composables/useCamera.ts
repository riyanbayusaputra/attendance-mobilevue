import { ref } from 'vue'

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const error = ref<string | null>(null)
  const isReady = ref(false)

  async function startCamera(videoEl: HTMLVideoElement) {
    error.value = null
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })
      videoEl.srcObject = stream.value
      videoEl.onloadedmetadata = () => {
        isReady.value = true
      }
    } catch {
      error.value = 'Tidak bisa mengakses kamera. Pastikan izin kamera diberikan.'
    }
  }

  function stopCamera() {
    stream.value?.getTracks().forEach((t) => t.stop())
    stream.value = null
    isReady.value = false
  }

  function capturePhoto(videoEl: HTMLVideoElement): string {
    const canvas = document.createElement('canvas')
    canvas.width = videoEl.videoWidth || 640
    canvas.height = videoEl.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    // Mirror flip untuk selfie
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(videoEl, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }

  return { stream, error, isReady, startCamera, stopCamera, capturePhoto }
}