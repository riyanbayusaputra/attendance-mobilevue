import * as faceapi from 'face-api.js'
import { ref } from 'vue'

export function useFaceApi() {
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadModels() {
    if (isLoaded.value) return
    isLoading.value = true
    error.value = null

    try {
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])
      isLoaded.value = true
    } catch (err) {
      error.value = 'Gagal memuat model AI.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return { isLoaded, isLoading, error, loadModels }
}