export type Role = 'teacher' | 'student'

export interface AuthResponse {
  success: boolean
  message: string
  role: Role
  username: string
  token: string
}

export interface CurrentUser {
  username: string
  role: Role
  token: string
}

export interface HealthResponse {
  status: string
  database: string
  timestamp: string
}

export interface DashboardResponse {
  total_students: number
  total_courses: number
  total_enrollments: number
  total_assignments: number
  active_students: number
  timestamp: string
}

export interface MetricsResponse {
  cpu_ready: boolean
  active_users: number
  courses: number
  enrollments: number
  assignments: number
  timestamp: string
}

export interface ReportSummary {
  students: number
  courses: number
  enrollments: number
  assignments: number
  generated_at: string
}

export interface VersionResponse {
  application: string
  version: string
  environment: string
}

export interface Student {
  id: number
  name: string
  email: string
  grade?: string | null
  created_at: string
}

export interface Course {
  id: number
  title: string
  description?: string | null
  level?: string | null
  created_at: string
}

export interface Assignment {
  id: number
  course_id: number
  title: string
  instructions?: string | null
  due_date?: string | null
  created_at: string
}
