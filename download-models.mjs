import { writeFileSync, mkdirSync, statSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'

const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
]

mkdirSync('./public/models', { recursive: true })

for (const file of files) {
  const dest = join('./public/models', file)

  // Skip kalau sudah ada dan tidak kosong
  try {
    const stat = statSync(dest)
    if (stat.size > 0) {
      console.log(`⏭ Skip ${file} (sudah ada ${stat.size} bytes)`)
      continue
    }
  } catch {}

  console.log(`⬇ Downloading ${file}...`)
  try {
    const res = await fetch(`${BASE_URL}/${file}`)
    const buffer = await res.arrayBuffer()
    writeFileSync(dest, Buffer.from(buffer))
    console.log(`✓ ${file} (${Buffer.from(buffer).length} bytes)`)
  } catch (err) {
    console.log(`✗ Gagal: ${file}`)
  }
}

console.log('\nSelesai! Cek folder public/models')