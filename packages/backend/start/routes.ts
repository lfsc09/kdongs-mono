/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

/**
 * AUTHENTICATION
 */
router.post('/login', '#controllers/auth/auth_controller.login')
router
  .post('/logout', '#controllers/auth/auth_controller.logout')
  .middleware([middleware.cookieToAuthHeader(), middleware.auth()])

/**
 * INVESTMENTS
 */
router
  .group(() => {
    router.resource('wallets', '#controllers/investments/wallets_controller')
    // router.resource('wallets.transactions', '#controllers/investments/wallet_transactions_controller')
    router.get('/performance', '#controllers/investments/wallets_performance_controller')
  })
  .prefix('/investments')
  .middleware([middleware.cookieToAuthHeader(), middleware.auth()])
