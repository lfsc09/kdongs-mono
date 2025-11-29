import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { environment } from '../environments/environment.development';
import { gatekeeperGuard } from './infra/guards/gatekeeper.guard';

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
  { path: '**', redirectTo: 'gate', pathMatch: 'full' },
];
