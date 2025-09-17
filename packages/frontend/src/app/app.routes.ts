import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { gatekeeperGuard } from './infra/guards/gatekeeper.guard';
import { investmentsRoutes } from './pages/private/modules/investments/investments.routes';

export const titleResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  return `${environment.title} - ${route.data['title']}`;
};

export const routes: Routes = [
  {
    path: 'gate',
    data: {
      title: 'Gate',
    },
    title: titleResolver,
    loadComponent: () => import('./pages/public/landing/landing').then((m) => m.Landing),
    canMatch: [gatekeeperGuard],
  },
  {
    path: 'r!',
    loadComponent: () =>
      import('./pages/private/landing-layout').then((module) => module.LandingLayout),
    canMatch: [gatekeeperGuard],
    children: [
      {
        path: 'home',
        data: {
          title: 'Home',
          shouldRouteExec: true,
        },
        title: titleResolver,
        redirectTo: 'investments',
        pathMatch: 'full',
      },
      {
        path: 'investments',
        children: investmentsRoutes,
      },
      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  { path: '**', redirectTo: 'gate', pathMatch: 'full' },
];
