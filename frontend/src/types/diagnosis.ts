export interface AnswerRequest {
  questionId: number
  choiceId: number
}

export interface DiagnosisRequest {
  answers: AnswerRequest[]
}

export interface DogTypeResponse {
  id: number
  code: string
  name: string
  title: string
  description: string
  trivia: string
  imageUrl: string | null
  sociability: number
  activity: number
  independence: number
  emotionalExpression: number
  caution: number
}

export interface UserScoresResponse {
  sociability: number
  activity: number
  independence: number
  emotionalExpression: number
  caution: number
}

export interface DiagnosisResponse {
  dogType: DogTypeResponse
  userScores: UserScoresResponse
}
