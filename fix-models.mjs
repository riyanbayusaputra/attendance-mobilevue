import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'

// Hanya download yang bermasalah
const files = [
      'face_recognition_model-weights_manifest.json', // ← tambah ini
  'face_recognition_model-shard1',
  'face_recognition_model-shard2', // ada 2 shard untuk recognition!
]

mkdirSync('./public/models', { recursive: true })

for (const file of files) {
  console.log(`⬇ Downloading ${file}...`)
  try {
    const res = await fetch(`${BASE_URL}/${file}`)
    if (!res.ok) {
      console.log(`⚠ ${file} tidak ada (status ${res.status}), skip`)
      continue
    }
    const buffer = await res.arrayBuffer()
    writeFileSync(join('./public/models', file), Buffer.from(buffer))
    console.log(`✓ ${file} (${Buffer.from(buffer).length} bytes)`)
  } catch (err) {
    console.log(`✗ Gagal: ${file} — ${err}`)
  }
}

console.log('\nSelesai!')