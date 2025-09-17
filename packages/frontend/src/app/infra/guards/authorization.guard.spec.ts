import { TestBed } from '@angular/core/testing';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';

import { ModulePermissions, UserIdentity } from '../services/identity/identity.model';
import { IdentityService } from '../services/identity/identity.service';
import { authorizationGuard } from './authorization.guard';

describe('permissionGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authorizationGuard(...guardParameters));
  let routerSpy = { parseUrl: jasmine.createSpy('parseUrl') };
  let identityServiceSpy = { identity: jasmine.createSpy('identity') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: IdentityService, useValue: identityServiceSpy },
      ],
    });
  });

  it('[identity=valid][segments=[]] should return "true" the user have permission', () => {
    identityServiceSpy.identity.and.returnValue({
      allowedIn: new Map<string, null>([['ROUTE_PERMISSION', null]]),
    } as UserIdentity);
    const input = {
      route: {
        data: {
          modulePermission: 'ROUTE_PERMISSION',
        },
      } as Route,
      segments: [] as UrlSegment[],
    };
    const result = executeGuard(input.route, input.segments);
    expect(result).toBeTrue();
  });

  it('[identity=null][segments=[]] should return "/r!" since UserIdentity cannot be verified AND segments is empty', () => {
    identityServiceSpy.identity.and.returnValue(null);
    const input = {
      route: {
        data: {
          modulePermission: 'ROUTE_PERMISSION',
        },
      } as Route,
      segments: [] as UrlSegment[],
    };
    executeGuard(input.route, input.segments);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/r!');
  });

  it('[identity=null][segments=["contracts", "new"]] should return "/contracts" since UserIdentity cannot be verified', () => {
    identityServiceSpy.identity.and.returnValue(null);
    const input = {
      route: {
        data: {
          modulePermission: 'ROUTE_PERMISSION',
        },
      } as Route,
      segments: [{ path: 'contracts' }, { path: 'new' }] as UrlSegment[],
    };
    executeGuard(input.route, input.segments);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('');
  });

  it('[identity=valid][segments=[]] should return "/r!" since the user does not have the permission AND segments is empty', () => {
    identityServiceSpy.identity.and.returnValue({
      allowedIn: new Map<string, null>(),
    } as UserIdentity);
    const input = {
      route: {
        data: {
          modulePermission: 'ROUTE_PERMISSION',
        },
      } as Route,
      segments: [] as UrlSegment[],
    };
    executeGuard(input.route, input.segments);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/r!');
  });

  it('[identity=valid][segments=["contracts", "new"]] should return "/contracts" since the user does not have the permission', () => {
    identityServiceSpy.identity.and.returnValue({
      allowedIn: new Map<string, null>(),
    } as UserIdentity);
    const input = {
      route: {
        data: {
          modulePermission: 'ROUTE_PERMISSION',
        },
      } as Route,
      segments: [{ path: 'contracts' }, { path: 'new' }] as UrlSegment[],
    };
    executeGuard(input.route, input.segments);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('');
  });
});
