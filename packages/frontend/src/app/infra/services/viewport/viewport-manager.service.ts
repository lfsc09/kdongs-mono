import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable, signal } from '@angular/core';
import { ViewportSize, viewportSizes } from './viewport-manager.model';

@Injectable({
  providedIn: 'root',
})
export class ViewportManagerService {
  /**
   * SERVICES
   */
  private readonly _breakpointObserver = inject(BreakpointObserver);

  /**
   * SIGNALS
   */
  private _currentViewport = signal<undefined | ViewportSize>(undefined);
  currentViewport = this._currentViewport.asReadonly();

  constructor() {
    // Observe the breakpoints to get the current ViewportSize
    this._breakpointObserver.observe(Object.values(viewportSizes)).subscribe((result) => {
      for (let breakpointQuery in result.breakpoints) {
        if (result.breakpoints[breakpointQuery]) {
          this._currentViewport.set(
            Object.keys(viewportSizes).find(
              (k) => viewportSizes[k as ViewportSize] === breakpointQuery,
            ) as ViewportSize,
          );
          return;
        }
      }
      this._currentViewport.set(undefined);
    });
  }
}
