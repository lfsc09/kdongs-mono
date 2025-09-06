import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import type { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetSefbfr from '#models/investment/asset_sefbfr';

export default class AssetSefbfrSplit extends BaseModel {
  static table = 'investment_asset_sefbfr_splits';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetSefbfrSplit: AssetSefbfrSplit) {
    assetSefbfrSplit.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare investmentAssetSefbfrId: string; // ID of the SEFBFR asset to which this split belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>;

  @column()
  declare dateUtc: DateTime; // Date of the SEFBFR split transaction

  @column({
    prepare: (value: Big) => value.toString(),
    consume: (value: string) => new Big(value),
  })
  declare factor: Big; // Factor by which shares are split (e.g. 1 to 5, the factor is 5)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;
}
