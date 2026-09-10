import { API_BASE_URL } from './config'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'

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

export async function postRegister(
  request: RegisterRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('このメールアドレスは既に登録されています')
    }
    throw new Error('新規登録に失敗しました')
  }

  return response.json()
}
