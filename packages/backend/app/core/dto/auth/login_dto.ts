import type { InferInput } from '@vinejs/vine/types'
import type { loginValidator } from '#validators/auth/login'

export type LoginRequest = InferInput<typeof loginValidator>

export type LoginResponse = {
  data: {
    userName: string
    userEmail: string
    allowedIn: string[] | undefined
    tokenExp: number | undefined
  }
  secureCookie: {
    token: string
  }
}
