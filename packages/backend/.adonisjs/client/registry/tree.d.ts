/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  user: {
    login: typeof routes['user.login']
    logout: typeof routes['user.logout']
  }
  analytic: {
    performance: typeof routes['analytic.performance']
    liquidationSeries: typeof routes['analytic.liquidation_series']
  }
  wallets: {
    index: typeof routes['wallets.index']
    create: typeof routes['wallets.create']
    store: typeof routes['wallets.store']
    show: typeof routes['wallets.show']
    edit: typeof routes['wallets.edit']
    update: typeof routes['wallets.update']
    destroy: typeof routes['wallets.destroy']
    movements: {
      index: typeof routes['wallets.movements.index']
      create: typeof routes['wallets.movements.create']
      store: typeof routes['wallets.movements.store']
      show: typeof routes['wallets.movements.show']
      edit: typeof routes['wallets.movements.edit']
      update: typeof routes['wallets.movements.update']
      destroy: typeof routes['wallets.movements.destroy']
    }
  }
}
