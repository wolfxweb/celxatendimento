import { getToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(
  path: string,
  method: string = 'GET',
  body?: any,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw error
  }

  return response.json()
}

export async function apiFetch<T>(path: string, options?: RequestInit) {
  return request<T>(path, 'GET', undefined, options)
}

export async function apiPost<T>(path: string, body: any, options?: RequestInit) {
  return request<T>(path, 'POST', body, options)
}

export async function apiPut<T>(path: string, body: any, options?: RequestInit) {
  return request<T>(path, 'PUT', body, options)
}

export async function apiPatch<T>(path: string, body: any, options?: RequestInit) {
  return request<T>(path, 'PATCH', body, options)
}

export async function apiDelete<T>(path: string, options?: RequestInit) {
  return request<T>(path, 'DELETE', undefined, options)
}

export async function apiUpload<T>(path: string, formData: FormData, options?: RequestInit) {
  return request<T>(path, 'POST', formData, options)
}
