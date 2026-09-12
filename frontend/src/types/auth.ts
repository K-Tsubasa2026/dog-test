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
}
