import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetSefbfrBonusShare from '#models/investment/asset_sefbfr_bonus_share';
import AssetSefbfrBuy from '#models/investment/asset_sefbfr_buy';
import AssetSefbfrDividend from '#models/investment/asset_sefbfr_dividend';
import AssetSefbfrInplit from '#models/investment/asset_sefbfr_inplit';
import AssetSefbfrSell from '#models/investment/asset_sefbfr_sell';
import AssetSefbfrSplit from '#models/investment/asset_sefbfr_split';
import AssetSefbfrTransfer from '#models/investment/asset_sefbfr_transfer';
import Wallet from '#models/investment/wallet';
import type { DoneState } from '../../core/types/investment/sefbfr.js';

export default class AssetSefbfr extends BaseModel {
  static table = 'investment_asset_sefbfrs';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetSefbfr: AssetSefbfr) {
    assetSefbfr.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare walletId: string; // ID of the wallet that holds this SEFBFR investment
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>;

  @column()
  declare doneState: DoneState; // Indicates the state of the SEFBFR investment

  @column()
  declare holderInstitution: string; // Institution where the SEFBFR is held

  @column()
  declare assetName: string; // Name of the SEFBFR asset

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  @hasMany(() => AssetSefbfrBuy, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrBuys: HasMany<typeof AssetSefbfrBuy>;

  @hasMany(() => AssetSefbfrSell, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrSells: HasMany<typeof AssetSefbfrSell>;

  @hasMany(() => AssetSefbfrTransfer, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrTransfers: HasMany<typeof AssetSefbfrTransfer>;

  @hasMany(() => AssetSefbfrBonusShare, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrBonusShares: HasMany<typeof AssetSefbfrBonusShare>;

  @hasMany(() => AssetSefbfrSplit, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrSplits: HasMany<typeof AssetSefbfrSplit>;

  @hasMany(() => AssetSefbfrInplit, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrInplits: HasMany<typeof AssetSefbfrInplit>;

  @hasMany(() => AssetSefbfrDividend, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrDividends: HasMany<typeof AssetSefbfrDividend>;
}
