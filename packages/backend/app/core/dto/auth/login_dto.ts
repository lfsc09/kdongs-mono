import type { loginValidator } from '#validators/auth/login'

export type LoginRequest = Awaited<ReturnType<typeof loginValidator.validate>>

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
