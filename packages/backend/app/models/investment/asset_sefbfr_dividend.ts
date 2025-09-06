import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import type { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetSefbfr from '#models/investment/asset_sefbfr';

export default class AssetSefbfrDividend extends BaseModel {
  static table = 'investment_asset_sefbfr_dividends';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetSefbfrDividend: AssetSefbfrDividend) {
    assetSefbfrDividend.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare investmentAssetSefbfrId: string; // ID of the SEFBFR asset to which the dividend belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>;

  @column()
  declare dateUtc: DateTime; // Date of the SEFBFR dividend transaction

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare value: Big; // Value of the dividend received

  @column({
    prepare: (value: Big | null) => (value ? value.toString() : null),
    consume: (value: string | null) => (value ? new Big(value) : null),
  })
  declare taxes: Big | null; // Taxes associated with the dividend transaction (negative)

  @column.dateTime()
  declare dateComUtc: DateTime | null; // Date of the dividend transaction in the company's records

  @column.dateTime()
  declare datePaymentUtc: DateTime | null; // Date when the dividend was paid

  @column()
  declare details: string | null; // Additional details about the dividend transaction

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;
}
