import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { UserAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import WalletService from '#services/investment/wallet_service'
import {
  deleteValidator,
  editValidator,
  indexValidator,
  showValidator,
  storeValidator,
  updateValidator,
} from '#validators/investment/wallet'

@inject()
export default class WalletController {
  constructor(private walletService: WalletService) {}

  /**
   * Display a list of resource
   */
  async index({ request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['investment.access']))
      return response.forbidden()
    const input = await indexValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.walletService.list(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to create a new record
   */
  async create({ response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const output = await this.walletService.create()
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await storeValidator.validate({
      ...request.body(),
      userId: auth.user?.id ?? '',
    })
    const output = await this.walletService.store(input)
    return response.status(201).json(output)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['investment.access']))
      return response.forbidden()
    const input = await showValidator.validate({
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    const output = await this.walletService.show(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to edit an existing record
   */
  async edit({ params, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await updateValidator.validate({
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    const output = await this.walletService.update(input)
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await editValidator.validate({
      ...request.body(),
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    const output = await this.walletService.edit(input)
    return response.status(200).json(output)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await deleteValidator.validate({
      userId: auth.user?.id ?? '',
      walletId: params.id,
    })
    await this.walletService.softDelete(input)
    return response.status(204)
  }
}
