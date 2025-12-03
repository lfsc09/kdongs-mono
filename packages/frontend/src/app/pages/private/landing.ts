import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { Subscription } from 'rxjs'
import { environment } from '../../../environments/environment.development'
import { IdentityService } from '../../infra/services/identity/identity.service'
import { SidebarModules } from './components/sidebar-modules/sidebar-modules'
import { Topbar } from './components/topbar/topbar'
import { LandingService } from './landing.service'

@Component({
  selector: 'kdongs-landing',
  imports: [RouterOutlet, SidebarModules, Topbar],
  providers: [LandingService],
  template: `
    <kdongs-cp-topbar />
    @if (!landingService.sidebarCollapsed()) {
      <kdongs-cp-sidebar-modules />
    }
    <router-outlet />
  `,
  host: {
    '(document:keyup.Control.;)': 'landingService.handleCollapse()',
  },
})
export class Landing implements OnInit, OnDestroy {
  /**
   * SERVICES
   */
  protected readonly landingService = inject(LandingService)
  private readonly _identityService = inject(IdentityService)
  private readonly _routerService = inject(Router)

  /**
   * SIGNALS AND OBSERVABLES
   */
  private _tokenExpLeftSubscription: Subscription | undefined
  private _clearTimeoutProcessToken: ReturnType<typeof setTimeout> | undefined

  ngOnInit(): void {
    this._tokenExpLeftSubscription = this._identityService.tokenExpLeft$.subscribe(
      (expLeft: number) => {
        if (expLeft > 0) {
          this._clearTimeoutProcessToken = setTimeout(() => {
            if (!this._identityService.processIdentity()) this._routerService.navigate(['/gate'])
          }, environment.token.interval)
        } else this._routerService.navigate(['/gate'])
      }
    )
  }

  ngOnDestroy(): void {
    this._tokenExpLeftSubscription?.unsubscribe()
    clearTimeout(this._clearTimeoutProcessToken)
  }
}
