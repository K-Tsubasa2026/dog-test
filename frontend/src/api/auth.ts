import { API_BASE_URL } from './config'
import type { LoginRequest, LoginResponse } from '../types/auth'

export async function postLogin(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('メールアドレスまたはパスワードが正しくありません')
  }

  return response.json()
}
