import { inject } from '@angular/core'
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router'
import { IdentityService } from '../services/identity/identity.service'

export const gatekeeperGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const firstSegment = segments?.[0]?.path ?? ''
  const isValidUserIdentity = inject(IdentityService).processIdentity()
  const router = inject(Router)

  // If no user identity found
  if (!isValidUserIdentity) {
    // If already at gate, just allow
    if (firstSegment === 'gate') return true

    // Otherwise must route to gate
    return router.parseUrl('/gate')
  }

  // If it has useridentity but I am at gate, go to `r!` (private section)
  if (firstSegment === 'gate') return router.parseUrl('/r!')

  // If have user identity and trying to reach other known routes, just allow
  return true
}
