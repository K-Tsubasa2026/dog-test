import { API_BASE_URL } from './config'
import { getToken } from '../utils/authToken'
import type { MeResponse } from '../types/user'
import type { DiagnosisHistoryItem } from '../types/diagnosis'

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(`ユーザー情報の取得に失敗しました (status: ${response.status})`)
  }

  return response.json()
}

export async function fetchMyDiagnoses(): Promise<DiagnosisHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/me/diagnoses`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(`診断履歴の取得に失敗しました (status: ${response.status})`)
  }

  return response.json()
}
