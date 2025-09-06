import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import type { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetBrlPublicBond from '#models/investment/asset_brl_public_bond';

export default class AssetBrlPublicBondBuy extends BaseModel {
  static table = 'investment_asset_brl_public_bond_buys';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetBrlPublicBondBuy: AssetBrlPublicBondBuy) {
    assetBrlPublicBondBuy.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare investmentAssetBrlPublicBondId: string; // ID of the public bond investment to which this buy transaction belongs
  @belongsTo(() => AssetBrlPublicBond)
  declare assetBrlPublicBond: BelongsTo<typeof AssetBrlPublicBond>;

  @column.dateTime()
  declare dateUtc: DateTime; // Date in UTC of the buy transaction

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare indexValue: Big; // Value of the index at the time of the buy

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare unitPrice: Big; // Price per unit at the time of the buy

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare sharesAmount: Big; // Amount of shares bought

  @column({
    prepare: (value: Big | null) => (value ? value.toString() : null),
    consume: (value: string | null) => (value ? new Big(value) : null),
  })
  declare fees: Big | null; // Fees associated with the buy transaction (negative)

  @column()
  declare details: string | null; // Additional details about the buy transaction

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
