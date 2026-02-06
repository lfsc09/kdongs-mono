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
        path: 'performance',
        loadComponent: () =>
          import('./wallet-performance/wallet-performance').then(
            module => module.WalletPerformance
          ),
      },
      // {
      //   path: 'wallets/create',
      //   loadComponent: () => import('./wallets/create-wallet/create-wallet').then((module) => module.CreateWalletComponent),
      // },
      { path: '', redirectTo: 'performance', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]
