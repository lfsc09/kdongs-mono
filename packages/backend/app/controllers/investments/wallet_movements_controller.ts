import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { anyUser } from '#abilities/main'
import WalletMovementsService from '#services/investments/wallet_movements_service'
import { deleteWalletMovementValidator } from '#validators/investment/wallet_movement/delete'
import { editWalletMovementValidator } from '#validators/investment/wallet_movement/edit'
import { indexWalletMovementsValidator } from '#validators/investment/wallet_movement/index'
import { showWalletMovementValidator } from '#validators/investment/wallet_movement/show'
import { storeWalletMovementValidator } from '#validators/investment/wallet_movement/store'
import { updateWalletMovementValidator } from '#validators/investment/wallet_movement/update'

@inject()
export default class WalletMovementsController {
  constructor(private walletMovementsService: WalletMovementsService) {}

  /**
   * Display a list of resource
   */
  async index({ params, request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await indexWalletMovementsValidator.validate({
      ...request.qs(),
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementsService.list(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to create a new record
   */
  async create({ response, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const output = await this.walletMovementsService.create()
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ params, request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await storeWalletMovementValidator.validate({
      ...request.body(),
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementsService.store(input)
    return response.status(201).json(output)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await showWalletMovementValidator.validate({
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementsService.show(input)
    return response.status(200).json(output)
  }

  /**
   * Display form to edit an existing record
   */
  async edit({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await updateWalletMovementValidator.validate({
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementsService.update(input)
    return response.status(200).json(output)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await editWalletMovementValidator.validate({
      ...request.body(),
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    const output = await this.walletMovementsService.edit(input)
    return response.status(200).json(output)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies(anyUser)) return response.forbidden()
    const input = await deleteWalletMovementValidator.validate({
      movementId: params.id,
      userId: auth.user?.id ?? '',
      walletId: params.wallet_id,
    })
    await this.walletMovementsService.hardDelete(input)
    return response.status(204)
  }
}
