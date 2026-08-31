import { API_BASE_URL } from './config'
import type { DiagnosisRequest, DiagnosisResponse } from '../types/diagnosis'

export async function postDiagnosis(
  request: DiagnosisRequest,
): Promise<DiagnosisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/diagnoses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`診断に失敗しました (status: ${response.status})`)
  }

  return response.json()
}
