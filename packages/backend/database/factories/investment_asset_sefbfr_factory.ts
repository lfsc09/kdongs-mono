import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import AssetSefbfr from '#models/investment/asset_sefbfr'
import { DoneStates } from '../../app/core/types/investment/sefbfr.js'
import { AssetSefbfrBonusShareFactory } from './investment_asset_sefbfr_bonus_share_factory.js'
import { AssetSefbfrBuyFactory } from './investment_asset_sefbfr_buy_factory.js'
import { AssetSefbfrDividendFactory } from './investment_asset_sefbfr_dividend_factory.js'
import { AssetSefbfrInplitFactory } from './investment_asset_sefbfr_inplit_factory.js'
import { AssetSefbfrSellFactory } from './investment_asset_sefbfr_sell_factory.js'
import { AssetSefbfrSplitFactory } from './investment_asset_sefbfr_split_factory.js'

export const AssetSefbfrFactory = factory
  .define(AssetSefbfr, async ({ faker }) => {
    const doneState = faker.helpers.weightedArrayElement([
      { value: DoneStates.active, weight: 0.6 },
      { value: DoneStates.done, weight: 0.3 },
      { value: DoneStates.transfered, weight: 0.1 },
    ])

    return {
      assetName: faker.finance.accountName(),
      createdAt: DateTime.fromJSDate(faker.date.past({ years: 3 })),
      doneState,
      holderInstitution: faker.company.name(),
    }
  })
  .state('asDone', b => {
    b.doneState = DoneStates.done
  })
  .state('asNotDone', b => {
    b.doneState = DoneStates.active
  })
  .state('asTransferred', b => {
    b.doneState = DoneStates.transfered
  })
  .relation('assetSefbfrBuys', () => AssetSefbfrBuyFactory)
  .relation('assetSefbfrSells', () => AssetSefbfrSellFactory)
  .relation('assetSefbfrBonusShares', () => AssetSefbfrBonusShareFactory)
  .relation('assetSefbfrDividends', () => AssetSefbfrDividendFactory)
  .relation('assetSefbfrInplits', () => AssetSefbfrInplitFactory)
  .relation('assetSefbfrSplits', () => AssetSefbfrSplitFactory)
  .build()
