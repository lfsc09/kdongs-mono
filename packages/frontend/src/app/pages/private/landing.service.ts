import { computed, inject, Injectable, signal } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { IdentityService } from '../../infra/services/identity/identity.service';
import { ModulePermissions, UserAllowedIn } from '../../infra/services/identity/identity.model';

@Injectable()
export class LandingService {
  /**
   * SERVICES
   */
  protected readonly identityService = inject(IdentityService);
  private readonly _router = inject(Router);

  /**
   * SIGNALS
   */
  sidebarCollapsed = signal<boolean>(true);
  userInfo = computed(() => ({
    userName: this.identityService.identity()?.userName ?? '?',
    userEmail: this.identityService.identity()?.userEmail ?? '?',
    avatar: this.generateAvatar(this.identityService.identity()?.userName ?? '?'),
  }));

  // Available routes for the user to navigate
  modules = computed(() =>
    [
      {
        label: 'Home',
        icon: 'fa-regular fa-house',
        url: '/r!/home',
      },
      (this.identityService.identity()?.allowedIn?.has(ModulePermissions.INVESTMENTS_ACCESS) ??
      false)
        ? {
            label: 'My Investments',
            icon: 'fa-solid fa-chart-line',
            url: '/r!/investments',
          }
        : null,
    ].filter((v) => !!v),
  );

  // TODO: Build the Routes tree for suggestions. MUST NOT suggest routes that user have no permission
  // TODO: When running Routes maybe use `:` prefix to specify a route `:param`, and `?` for specifying queryParams.
  /**
   * TIP: Inside `data` on each Route in the config, say if the Route should be considered for this.
   *      Also inside `data` of dynamic Routes with `:param` give the REGEX information, if the `:param` should have restricted values.
   */
  private _routesRegexp = computed<RegExp[]>(() => {
    return this.buildRoutesRegexp(
      '',
      this._router.config,
      this.identityService.identity()?.allowedIn ?? new Map<ModulePermissions, null>(),
    ) as RegExp[];
  });

  /**
   * FUNCTIONS
   */
  handleCollapse(): void {
    this.sidebarCollapsed.update((curr) => !curr);
  }

  /**
   * Check if the route given to navigate is valid and executable by the user
   * @param route Route to check
   * @returns true if route is executable, false otherwise
   */
  isExecutableRoute(route: string): boolean {
    return this._routesRegexp().some((rRegExp) => rRegExp.test(route));
  }

  private buildRoutesRegexp(
    currRegExp: string,
    routes: Routes,
    userAllowedIn: UserAllowedIn,
  ): RegExp[] {
    let regExps: RegExp[] = [];
    for (let route of routes) {
      // Check if route should be used in ExecutableRoutes
      let considerThisRoute = route.data?.['shouldRouteExec'] ?? false;

      // TODO: Test this code to see if it works as expected
      // If route uses `authorizationGuard`, check if users have permissions
      if (
        considerThisRoute &&
        (route.canMatch?.some((cM) => cM === 'authorizationGuard') ?? false)
      ) {
        considerThisRoute &&= userAllowedIn.has(route.data?.['modulePermission']) ?? false;
      }

      // build currRegExp with default `path` or `routeExecRegExp`
      let regExp: string = currRegExp;
      if (route.data && 'routeExecRegExp' in route.data) {
        regExp += route.data['routeExecRegExp'];
      } else regExp += route.path !== '' ? `/${route.path}` : '';

      if (considerThisRoute) regExps.push(new RegExp(`^${regExp}$`));

      // look at its children
      if (route.children?.length ?? 0) {
        const childrenRegExps = this.buildRoutesRegexp(regExp, route.children!, userAllowedIn);
        regExps.push(...childrenRegExps);
      }
    }
    return regExps;
  }

  /**
   * Generate avatar object for user
   * @param userName User's name
   * @returns Avatar object
   */
  private generateAvatar(userName: string): { fallback: string } {
    return {
      fallback: userName.charAt(0).toUpperCase(),
    };
  }
}
