import { TestBed } from '@angular/core/testing'
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router'
import { IdentityService } from '../services/identity/identity.service'
import { gatekeeperGuard } from './gatekeeper.guard'

/**
 * IMPORTANT: Invalid routes are not treated inside the guard, they are always redirected to /gate in the Routes config.
 */
describe('gatekeeperGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => gatekeeperGuard(...guardParameters))
  let routerSpy = { parseUrl: jasmine.createSpy('parseUrl') }
  let identityManagerSpy = { processIdentity: jasmine.createSpy('processIdentity') }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: IdentityService, useValue: identityManagerSpy },
      ],
    })
  })

  it('[processIdentity=false][url="/gate"] should return "true" since doesnt have user identity but it is already at gate', () => {
    identityManagerSpy.processIdentity.and.returnValue(false)
    const input = {
      route: {} as Route,
      segments: [{ path: 'gate' }] as UrlSegment[],
    }
    const result = executeGuard(input.route, input.segments)
    expect(result).toBeTrue()
  })

  it('[processIdentity=false][url="/valid-route"] should return UrlTree "/gate" since doesnt have user identity', () => {
    identityManagerSpy.processIdentity.and.returnValue(false)
    const input = {
      route: {} as Route,
      segments: [{ path: 'valid-route' }] as UrlSegment[],
    }
    executeGuard(input.route, input.segments)
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/gate')
  })

  it('[processIdentity=true][url="/gate"] should return UrlTree "/r!" since it does have a valid user identity', () => {
    identityManagerSpy.processIdentity.and.returnValue(true)
    const input = {
      route: {} as Route,
      segments: [{ path: 'gate' }] as UrlSegment[],
    }
    executeGuard(input.route, input.segments)
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/r!')
  })

  it('[processIdentity=true][url="/valid-route"] should return "true" since it does have a user identity and url is a valid route', () => {
    identityManagerSpy.processIdentity.and.returnValue(true)
    const input = {
      route: {} as Route,
      segments: [{ path: 'valid-route' }] as UrlSegment[],
    }
    const result = executeGuard(input.route, input.segments)
    expect(result).toBeTrue()
  })
})
