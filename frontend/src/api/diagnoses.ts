import { API_BASE_URL } from './config'
import { getToken } from '../utils/authToken'
import type { DiagnosisRequest, DiagnosisResponse } from '../types/diagnosis'

export async function postDiagnosis(
  request: DiagnosisRequest,
): Promise<DiagnosisResponse> {
  const token = getToken()
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  // ログイン中はトークンを付けて送る(バックエンド側で本人の診断履歴として保存される)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/api/diagnoses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`診断に失敗しました (status: ${response.status})`)
  }

  return response.json()
}
