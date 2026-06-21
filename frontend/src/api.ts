import {
  Assignment,
  AuthResponse,
  Course,
  CurrentUser,
  DashboardResponse,
  HealthResponse,
  MetricsResponse,
  ReportSummary,
  Role,
  Student,
  VersionResponse,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers ?? {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      message = data.detail ?? message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function login(role: Role, username: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, username, password }),
  })
}

export async function me(token: string) {
  return request<CurrentUser>('/auth/me', {}, token)
}

export async function getDashboard(token: string) {
  return request<DashboardResponse>('/dashboard', {}, token)
}

export async function getHealth(token?: string) {
  return request<HealthResponse>('/health', {}, token)
}

export async function getReady() {
  return request<{ status: string }>('/ready')
}

export async function getVersion() {
  return request<VersionResponse>('/version')
}

export async function getMetrics(token: string) {
  return request<MetricsResponse>('/metrics', {}, token)
}

export async function getReports(token: string) {
  return request<ReportSummary>('/reports/summary', {}, token)
}

export async function getStudents(token: string) {
  return request<Student[]>('/students', {}, token)
}

export async function createStudent(
  token: string,
  payload: Pick<Student, 'name' | 'email' | 'grade'>
) {
  return request<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export async function updateStudent(
  token: string,
  id: number,
  payload: Partial<Pick<Student, 'name' | 'email' | 'grade'>>
) {
  return request<Student>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token)
}

export async function deleteStudent(token: string, id: number) {
  return request<void>(`/students/${id}`, { method: 'DELETE' }, token)
}

export async function getCourses(token: string) {
  return request<Course[]>('/courses', {}, token)
}

export async function createCourse(
  token: string,
  payload: Pick<Course, 'title' | 'description' | 'level'>
) {
  return request<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export async function updateCourse(
  token: string,
  id: number,
  payload: Partial<Pick<Course, 'title' | 'description' | 'level'>>
) {
  return request<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token)
}

export async function deleteCourse(token: string, id: number) {
  return request<void>(`/courses/${id}`, { method: 'DELETE' }, token)
}

export async function getAssignments(token: string) {
  return request<Assignment[]>('/assignments', {}, token)
}

export async function createAssignment(
  token: string,
  payload: Pick<Assignment, 'course_id' | 'title' | 'instructions' | 'due_date'>
) {
  return request<Assignment>('/assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export async function createEnrollment(
  token: string,
  payload: { student_id: number; course_id: number }
) {
  return request('/enrollments', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export const apiBase = API_BASE
