import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { UserAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import WalletMovementService from '#services/investment/wallet_movement_service'
import {
  deleteValidator,
  editValidator,
  indexValidator,
  showValidator,
  storeValidator,
  updateValidator,
} from '#validators/investment/wallet_movement'

@inject()
export default class WalletMovementController {
  constructor(private walletMovementService: WalletMovementService) {}

  /**
   * Display a list of resource
   */
  async index({ params, request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['investment.access']))
      return response.forbidden()
    const input = await indexValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementService.list(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to create a new record
   */
  async create({ response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const output = await this.walletMovementService.create()
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ params, request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await storeValidator.validate({
      ...request.body(),
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementService.store(input)
    return response.status(201).json(output)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['investment.access']))
      return response.forbidden()
    const input = await showValidator.validate({
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementService.show(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to edit an existing record
   */
  async edit({ params, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await editValidator.validate({
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementService.update(input)
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await updateValidator.validate({
      ...request.body(),
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementService.edit(input)
    return response.status(200).json(output)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth }: HttpContext) {
    if (!auth.user!.currentAccessToken?.allows(UserAbilities['wallet.mutate']))
      return response.forbidden()
    const input = await deleteValidator.validate({
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    await this.walletMovementService.hardDelete(input)
    return response.status(204)
  }
}
