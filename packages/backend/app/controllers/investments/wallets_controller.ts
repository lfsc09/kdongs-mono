import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { anyUser } from '#abilities/main'
import WalletsService from '#services/investments/wallets_service'
import { deleteWalletValidator } from '#validators/investment/wallet/delete'
import { editWalletValidator } from '#validators/investment/wallet/edit'
import { indexWalletsValidator } from '#validators/investment/wallet/index'
import { showWalletValidator } from '#validators/investment/wallet/show'
import { storeWalletValidator } from '#validators/investment/wallet/store'

@inject()
export default class WalletsController {
  constructor(private walletsService: WalletsService) {}

  /**
   * Display a list of resource
   */
  async index({ request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await indexWalletsValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.walletsService.list(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to create a new record
   */
  async create({ response, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const output = await this.walletsService.create()
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await storeWalletValidator.validate({
      ...request.body(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.walletsService.store(input)
    return response.status(201).json(output)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await showWalletValidator.validate({
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    const output = await this.walletsService.show(input)
    return response.status(200).json(output)
  }

  /**
   * Edit individual record
   */
  async edit({ params, request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await editWalletValidator.validate({
      ...request.body(),
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    const output = await this.walletsService.edit(input)
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ response }: HttpContext) {
    return response.status(204)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await deleteWalletValidator.validate({
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    await this.walletsService.softDelete(input)
    return response.status(204)
  }
}
