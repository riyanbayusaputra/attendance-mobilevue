export interface Company {
  id: number
  name: string
  address: string | null
  latitude: number
  longitude: number
  radius_meters: number
}

export interface User {
  id: number
  name: string
  email: string
  employee_id: string | null
  phone: string | null
  photo: string | null
  role: string
  company: Company | null
}

export interface Presence {
  id: number
  user_id: number
  company_id: number
  date: string
  check_in_at: string | null
  check_out_at: string | null
  check_in_lat: number | null
  check_in_lng: number | null
  check_out_lat: number | null
  check_out_lng: number | null
  check_in_photo: string | null
  check_out_photo: string | null
  is_within_radius: boolean
  is_fake_gps: boolean
  status: 'present' | 'late' | 'absent'
  notes: string | null
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
  device_name?: string
}

export interface CheckInPayload {
  latitude: number
  longitude: number
  photo: string
  is_fake_gps: boolean
}

export interface CheckOutPayload {
  latitude: number
  longitude: number
  photo: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}