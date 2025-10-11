import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { anyUser } from '#abilities/main';
import WalletsPerformanceService from '#services/investments/wallets_performance_service';
import { showSelectedWalletsPerformanceValidator } from '#validators/investment/wallet_performance/show';

@inject()
export default class WalletsPerformanceController {
  constructor(private walletsPerformanceService: WalletsPerformanceService) {}

  async getSelectedWalletsPerformance({ request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden();
    const input = await showSelectedWalletsPerformanceValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    });
    const output = await this.walletsPerformanceService.show(input);
    return response.status(200).json(output);
  }
}
