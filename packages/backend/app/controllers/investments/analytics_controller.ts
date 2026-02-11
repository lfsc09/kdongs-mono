import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { anyUser } from '#abilities/main'
import AnalyticsService from '#services/investments/analytics_service'
import { liquidationSeriesAnalyticsValidator } from '#validators/investment/analytic/liquidation_series'
import { performanceAnalyticsValidator } from '#validators/investment/analytic/performance'

@inject()
export default class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  async performance({ request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await performanceAnalyticsValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.analyticsService.performance(input)
    return response.status(200).json(output)
  }

  async liquidationSeries({ request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await liquidationSeriesAnalyticsValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.analyticsService.liquidationSeries(input)
    return response.status(200).json(output)
  }
}
