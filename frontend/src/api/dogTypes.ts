import { API_BASE_URL } from './config'
import type { DogTypeResponse } from '../types/diagnosis'

export async function fetchDogTypes(): Promise<DogTypeResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/dog-types`)

  if (!response.ok) {
    throw new Error(`犬種一覧の取得に失敗しました (status: ${response.status})`)
  }

  return response.json()
}
