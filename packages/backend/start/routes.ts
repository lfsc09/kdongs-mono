/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

/**
 * USER
 */
router.post('login', [controllers.user.User, 'login'])
router
  .delete('logout', [controllers.user.User, 'logout'])
  .middleware([middleware.cookieToAuthHeader(), middleware.auth()])

/**
 * INVESTMENTS
 */
router
  .group(() => {
    router.get('performance', [controllers.investment.Analytic, 'performance'])
    router.get('liquidation-series', [controllers.investment.Analytic, 'liquidationSeries'])
    router.resource('wallets', controllers.investment.Wallet)
    router.resource('wallets.movements', controllers.investment.WalletMovement)
  })
  .prefix('/investments')
  .middleware([middleware.cookieToAuthHeader(), middleware.auth()])
