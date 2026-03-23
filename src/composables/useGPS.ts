import { ref } from 'vue'

export interface GPSCoords {
  latitude: number
  longitude: number
  accuracy: number
  speed: number | null
  altitude: number | null
}

export function useGPS() {
  const coords = ref<GPSCoords | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  function getCurrentPosition(): Promise<GPSCoords> {
    return new Promise((resolve, reject) => {
      loading.value = true
      error.value = null

      if (!navigator.geolocation) {
        error.value = 'GPS tidak didukung perangkat ini.'
        loading.value = false
        reject(new Error(error.value))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coords.value = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            altitude: pos.coords.altitude,
          }
          loading.value = false
          resolve(coords.value)
        },
        (err) => {
          const messages: Record<number, string> = {
            1: 'Izin lokasi ditolak.',
            2: 'Lokasi tidak tersedia.',
            3: 'Waktu mendapatkan lokasi habis.',
          }
          error.value = messages[err.code] ?? 'Gagal mendapatkan lokasi.'
          loading.value = false
          reject(new Error(error.value))
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      )
    })
  }

  // Hitung jarak dari koordinat perusahaan (meter)
  function getDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  return { coords, error, loading, getCurrentPosition, getDistance }
}