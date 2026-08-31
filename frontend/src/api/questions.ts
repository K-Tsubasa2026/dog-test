import { API_BASE_URL } from './config'
import type { QuestionResponse } from '../types/question'

export async function fetchQuestions(): Promise<QuestionResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/questions`)

  if (!response.ok) {
    throw new Error(`質問の取得に失敗しました (status: ${response.status})`)
  }

  return response.json()
}
