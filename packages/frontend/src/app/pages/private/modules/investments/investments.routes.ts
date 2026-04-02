import { Routes } from '@angular/router'
import { UserAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import { titleResolver } from '../../../../app.routes'
import { authorizationGuard } from '../../../../infra/guards/authorization.guard'

export const investmentsRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'My Investments',
      shouldRouteExec: true,
      modulePermission: UserAbilities['investment.access'],
    },
    title: titleResolver,
    loadComponent: () => import('./investments').then(module => module.Investments),
    canMatch: [authorizationGuard],
    children: [
      {
        data: {
          showPerformanceFilter: true,
        },
        path: 'performance',
        loadComponent: () => import('./performance/performance').then(module => module.Performance),
      },
      {
        path: 'wallets',
        loadComponent: () => import('./wallet/wallet').then(module => module.Wallet),
      },
      {
        path: 'wallets/new',
        loadComponent: () =>
          import('./wallet/wallet-form/wallet-form').then(module => module.WalletForm),
      },
      {
        path: 'wallets/:walletId',
        loadComponent: () =>
          import('./wallet/wallet-detail/wallet-detail').then(module => module.WalletDetail),
      },
      {
        path: 'wallets/:walletId/edit',
        loadComponent: () =>
          import('./wallet/wallet-form/wallet-form').then(module => module.WalletForm),
      },
      {
        path: 'wallets/:walletId/movements/new',
        loadComponent: () =>
          import('./wallet-movement/wallet-movement-form/wallet-movement-form').then(
            module => module.WalletMovementForm
          ),
      },
      {
        path: 'wallets/:walletId/movements/:movementId',
        loadComponent: () =>
          import('./wallet-movement/wallet-movement-detail/wallet-movement-detail').then(
            module => module.WalletMovementDetail
          ),
      },
      {
        path: 'wallets/:walletId/movements/:movementId/edit',
        loadComponent: () =>
          import('./wallet-movement/wallet-movement-form/wallet-movement-form').then(
            module => module.WalletMovementForm
          ),
      },
      { path: '', redirectTo: 'wallets', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]
