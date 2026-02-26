import { Routes } from '@angular/router'
import { titleResolver } from '../../../../app.routes'
import { authorizationGuard } from '../../../../infra/guards/authorization.guard'

export const investmentsRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'My Investments',
      shouldRouteExec: true,
      modulePermission: 'INVESTMENTS_ACCESS',
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
      { path: '', redirectTo: 'wallets', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]
