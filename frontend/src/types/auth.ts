import type { UserScoresResponse } from './diagnosis'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  // 「自分のわんこタイプを知っている」から登録した場合だけ値を入れる
  dogTypeId?: number
  // 診断結果画面の「結果を登録する」から登録した場合だけ値を入れる
  userScores?: UserScoresResponse
}
