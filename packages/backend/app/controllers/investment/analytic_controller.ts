import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { UserAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import AnalyticService from '#services/investment/analytic_service'
import { liquidationSeriesValidator, performanceValidator } from '#validators/investment/analytic'

@inject()
export default class AnalyticController {
  constructor(private analyticService: AnalyticService) {}

  async performance({ request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['investment.access']))
      return response.forbidden()
    const input = await performanceValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.analyticService.performance(input)
    return response.status(200).json(output)
  }

  async liquidationSeries({ request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['investment.access']))
      return response.forbidden()
    const input = await liquidationSeriesValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.analyticService.liquidationSeries(input)
    return response.status(200).json(output)
  }
}
