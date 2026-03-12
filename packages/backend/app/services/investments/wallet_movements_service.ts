import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import Big from 'big.js'
import Wallet from '#models/investment/wallet'
import WalletMovement from '#models/investment/wallet_movement'
import { CreateWalletMovementResponse } from '../../core/dto/investment/wallet_movement/create_dto.js'
import { DeleteWalletMovementRequest } from '../../core/dto/investment/wallet_movement/delete_dto.js'
import {
  EditWalletMovementRequest,
  EditWalletMovementResponse,
} from '../../core/dto/investment/wallet_movement/edit_dto.js'
import {
  IndexWalletMovementsRequest,
  IndexWalletMovementsResponse,
} from '../../core/dto/investment/wallet_movement/index_dto.js'
import {
  ShowWalletMovementRequest,
  ShowWalletMovementResponse,
} from '../../core/dto/investment/wallet_movement/show_dto.js'
import { StoreWalletMovementRequest } from '../../core/dto/investment/wallet_movement/store_dto.js'
import { UpdateWalletMovementRequest } from '../../core/dto/investment/wallet_movement/update_dto.js'
import { acceptedCurrencyCodes, CurrencyCode } from '../../core/types/investment/currency.js'
import {
  acceptedWalletMovementTypes,
  WalletMovementType,
} from '../../core/types/investment/wallet_movement.js'

@inject()
export default class WalletMovementsService {
  constructor(protected logger: Logger) {}

  async list(input: IndexWalletMovementsRequest): Promise<IndexWalletMovementsResponse> {
    const page = Number(input.page) ?? 1
    const limit = Number(input.limit) ?? 10
    const sortOrder = input.sortOrder ?? 'desc'
    let sortBy: string

    switch (input.sortBy) {
      case 'movementId':
        sortBy = 'id'
        break
      case 'movementOriginAmount':
        sortBy = 'originAmount'
        break
      case 'movementResultAmount':
        sortBy = 'resultAmount'
        break
      case 'movementDateUtc':
        sortBy = 'dateUtc'
        break
      default:
        sortBy = 'id'
        break
    }

    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()

    const movements = await WalletMovement.query()
      .andWhere('walletId', wallet.id)
      .orderBy(sortBy, sortOrder)
      .paginate(page, limit)

    return {
      data: {
        movements: movements.all().map((movement: WalletMovement) => ({
          createdAt: movement.createdAt.toISO() ?? undefined,
          dateUtc: movement.dateUtc.toISO() ?? undefined,
          hasConversion: movement.originCurrencyCode !== movement.resultCurrencyCode,
          id: movement.id,
          movementType: movement.movementType,
          originAmount: movement.originAmount.round(2, Big.roundHalfEven).toNumber(),
          originCurrencyCode: movement.originCurrencyCode,
          originExchGrossRate:
            movement.originExchGrossRate?.round(6, Big.roundHalfEven).toNumber() ?? undefined,
          originExchOpFee:
            movement.originExchOpFee?.round(2, Big.roundHalfEven).toNumber() ?? undefined,
          originExchVetRate:
            movement.originExchVetRate?.round(6, Big.roundHalfEven).toNumber() ?? undefined,
          resultAmount: movement.resultAmount.round(2, Big.roundHalfEven).toNumber(),
          resultCurrencyCode: movement.resultCurrencyCode,
          updatedAt: movement.updatedAt?.toISO() ?? undefined,
        })),
      },
      metadata: {
        limit: movements.perPage,
        nextPage: movements.hasMorePages ? movements.currentPage + 1 : undefined,
        page: movements.currentPage,
        previousPage: movements.currentPage > 1 ? movements.currentPage - 1 : undefined,
        totalCount: movements.total,
        totalPages: movements.lastPage,
      },
    }
  }

  async create(): Promise<CreateWalletMovementResponse> {
    return {
      data: {
        currencyCodes: acceptedCurrencyCodes.sort() as CurrencyCode[],
        movementTypes: acceptedWalletMovementTypes.sort() as WalletMovementType[],
      },
    }
  }

  async store(input: StoreWalletMovementRequest): Promise<void> {
    const hasConversion = input.originCurrencyCode !== input.resultCurrencyCode
    const originAmount = new Big(input.originAmount)
    // originExchGrossRate must ALWAYS be in the same currency as the originAmount
    const originExchGrossRate =
      hasConversion && input.originExchGrossRate ? new Big(input.originExchGrossRate) : null
    const originExchOpFee =
      hasConversion && input.originExchOpFee ? new Big(input.originExchOpFee).abs().neg() : null

    const originExchVetRate = originExchGrossRate
      ? originExchGrossRate.plus(originExchOpFee ?? 0)
      : null

    // Since originAmount is always divided, the originExchVetRate must be in the same Currency as originAmount
    const resultAmount =
      hasConversion && originExchVetRate
        ? originAmount.div(originExchVetRate)
        : new Big(input.originAmount)

    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()

    await WalletMovement.create({
      dateUtc: input.dateUtc,
      details: input.details,
      institution: input.institution,
      movementType: input.movementType as WalletMovementType,
      originAmount,
      originCurrencyCode: input.originCurrencyCode as CurrencyCode,
      originExchGrossRate,
      originExchOpFee,
      originExchVetRate,
      resultAmount,
      resultCurrencyCode: input.resultCurrencyCode as CurrencyCode,
      walletId: wallet.id,
    })
  }

  async show(input: ShowWalletMovementRequest): Promise<ShowWalletMovementResponse> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()

    const movement = await WalletMovement.query()
      .where('id', input.movementId)
      .where('walletId', wallet.id)
      .firstOrFail()

    return {
      data: {
        movementId: movement.id,
      },
    }
  }

  async edit(input: EditWalletMovementRequest): Promise<EditWalletMovementResponse> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()

    const movement = await WalletMovement.query()
      .where('id', input.movementId)
      .where('walletId', wallet.id)
      .firstOrFail()

    return {
      data: {
        currencyCodes: acceptedCurrencyCodes.sort() as CurrencyCode[],
        movement: {
          dateUtc: movement.dateUtc.toISO() ?? undefined,
          details: movement.details ?? undefined,
          institution: movement.institution ?? undefined,
          movementType: movement.movementType,
          originAmount: movement.originAmount.round(2, Big.roundHalfEven).toNumber(),
          originCurrencyCode: movement.originCurrencyCode,
          originExchGrossRate:
            movement.originExchGrossRate?.round(6, Big.roundHalfEven).toNumber() ?? undefined,
          originExchOpFee:
            movement.originExchOpFee?.round(2, Big.roundHalfEven).toNumber() ?? undefined,
          originExchVetRate:
            movement.originExchVetRate?.round(6, Big.roundHalfEven).toNumber() ?? undefined,
          resultAmount: movement.resultAmount.round(2, Big.roundHalfEven).toNumber(),
          resultCurrencyCode: movement.resultCurrencyCode,
        },
        movementTypes: acceptedWalletMovementTypes.sort() as WalletMovementType[],
      },
    }
  }

  async update(input: UpdateWalletMovementRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()

    const movement = await WalletMovement.query()
      .where('id', input.movementId)
      .where('walletId', wallet.id)
      .firstOrFail()

    if (input.movementType) {
      movement.movementType = input.movementType as WalletMovementType
    }
    if (input.dateUtc) {
      movement.dateUtc = input.dateUtc
    }
    if (input.institution) {
      movement.institution = input.institution
    }
    if (input.originCurrencyCode) {
      movement.originCurrencyCode = input.originCurrencyCode as CurrencyCode
    }
    if (input.originAmount) {
      movement.originAmount = new Big(input.originAmount)
    }
    if (input.originExchGrossRate) {
      movement.originExchGrossRate = new Big(input.originExchGrossRate)
    }
    if (input.originExchOpFee) {
      movement.originExchOpFee = new Big(input.originExchOpFee).abs().neg()
    }
    if (input.resultCurrencyCode) {
      movement.resultCurrencyCode = input.resultCurrencyCode as CurrencyCode
    }
    if (input.details) {
      movement.details = input.details
    }

    // Recalculate resultAmount and originExchVetRate if necessary
    const hasConversion = movement.originCurrencyCode !== movement.resultCurrencyCode
    if (hasConversion) {
      movement.originExchVetRate = movement.originExchGrossRate
        ? movement.originExchGrossRate.plus(movement.originExchOpFee ?? 0)
        : null

      movement.resultAmount = movement.originExchVetRate
        ? movement.originAmount.div(movement.originExchVetRate)
        : movement.originAmount
    } else {
      movement.resultAmount = movement.originAmount
      movement.originExchGrossRate = null
      movement.originExchOpFee = null
      movement.originExchVetRate = null
    }

    await movement.save()
  }

  async hardDelete(input: DeleteWalletMovementRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()

    const movement = await WalletMovement.query()
      .where('id', input.movementId)
      .where('walletId', wallet.id)
      .firstOrFail()

    await movement.delete()
  }
}
