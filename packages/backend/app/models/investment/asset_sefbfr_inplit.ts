import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import type { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetSefbfr from '#models/investment/asset_sefbfr';

export default class AssetSefbfrInplit extends BaseModel {
  static table = 'investment_asset_sefbfr_inplits';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetSefbfrInplit: AssetSefbfrInplit) {
    assetSefbfrInplit.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare investmentAssetSefbfrId: string; // ID of the SEFBFR asset to which this inplit belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>;

  @column()
  declare dateUtc: DateTime; // Date of the SEFBFR inplit transaction

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare factor: Big; // Factor by which shares are inplit (e.g. 5 to 1, the factor is 5)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;
}
