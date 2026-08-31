export interface ChoiceResponse {
  id: number
  content: string
}

export interface QuestionResponse {
  id: number
  content: string
  displayOrder: number
  choices: ChoiceResponse[]
}
