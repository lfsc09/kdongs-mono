import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import type { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetSefbfr from '#models/investment/asset_sefbfr';

export default class AssetSefbfrTransfer extends BaseModel {
  static table = 'investment_asset_sefbfr_transfers';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetSefbfrTransfer: AssetSefbfrTransfer) {
    assetSefbfrTransfer.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare investmentAssetSefbfrId: string; // ID of the SEFBFR asset to which this transfer belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>;

  @column()
  declare dateUtc: DateTime; // Date of the SEFBFR transfer transaction

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare sharesAmount: Big; // Number of shares transferred (Negative for sending institution, positive for receiving institution)

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare closePriceQuote: Big; // Previous day closing price per share of transfer (Only for receiving institution)

  @column()
  declare previousInstitution: string; // Previous institution holding the shares

  @column()
  declare newInstitution: string; // New institution receiving the shares

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;
}
