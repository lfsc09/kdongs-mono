import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { anyUser } from '#abilities/main'
import WalletsService from '#services/investments/wallets_service'
import { handleSelectedWalletsPerformanceValidator } from '#validators/investment/wallet_performance/handle'

@inject()
export default class WalletsPerformanceController {
  constructor(private walletsService: WalletsService) {}

  async handle({ request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await handleSelectedWalletsPerformanceValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.walletsService.walletsPerformance(input)
    return response.status(200).json(output)
  }
}
