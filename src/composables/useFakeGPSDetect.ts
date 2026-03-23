import { ref } from 'vue'
import type { GPSCoords } from './useGPS'

export function useFakeGPSDetect() {
  const isFakeGPS = ref(false)
  const reasons = ref<string[]>([])

  function detect(coords: GPSCoords): boolean {
    reasons.value = []

    // Cek 1: Akurasi terlalu sempurna
    if (coords.accuracy < 5) {
      reasons.value.push('Akurasi GPS mencurigakan')
    }

    // Cek 2: Speed tidak masuk akal (> 180 km/h)
    if (coords.speed !== null && coords.speed !== undefined && coords.speed > 50) {
      reasons.value.push('Kecepatan tidak wajar')
    }

    // Cek 3: Koordinat terlalu bulat (ciri emulator)
    // FIX: pakai optional chaining ?.length ?? 0
    const latStr = coords.latitude.toString()
    const lngStr = coords.longitude.toString()
    const latDecimals = latStr.includes('.') ? (latStr.split('.')[1]?.length ?? 0) : 0
    const lngDecimals = lngStr.includes('.') ? (lngStr.split('.')[1]?.length ?? 0) : 0

    if (latDecimals <= 2 && lngDecimals <= 2) {
      reasons.value.push('Koordinat tidak presisi')
    }

    isFakeGPS.value = reasons.value.length >= 2
    return isFakeGPS.value
  }

  return { isFakeGPS, reasons, detect }
}