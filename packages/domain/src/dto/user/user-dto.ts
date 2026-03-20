import { UserAbility } from '../../types/auth/abilities.js'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  userName: string
  userEmail: string
  allowedIn: UserAbility[]
  tokenExp: number
}
