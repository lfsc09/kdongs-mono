import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { IdentityService } from '../services/identity/identity.service';

export const authorizationGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const allow: boolean =
    inject(IdentityService)
      .identity()
      ?.allowedIn.has(route?.data?.['modulePermission'] ?? '') ?? false;

  if (allow) return true;

  const router = inject(Router);
  if (segments.length === 0) return router.parseUrl('/r!');
  return router.parseUrl('');
};
