import { FrontendRole } from '../../types/auth/frontend-role.js'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  userName: string
  userEmail: string
  allowedIn: FrontendRole[]
  tokenExp: number
}
