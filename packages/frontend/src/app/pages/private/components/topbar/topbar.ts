import { AsyncPipe, CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core'
import { NavigationEnd, Router, RouterLink } from '@angular/router'
import { filter, map, Subscription } from 'rxjs'
import { environment } from '../../../../../environments/environment.development'
import { IdentityService } from '../../../../infra/services/identity/identity.service'
import { CircularProgress } from '../../../components/circular-progress/circular-progress'
import { LandingService } from '../../landing.service'

@Component({
  selector: 'kdongs-cp-topbar',
  templateUrl: './topbar.html',
  imports: [RouterLink, AsyncPipe, CommonModule, CircularProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar implements OnInit, OnDestroy {
  /**
   * SERVICES
   */
  protected readonly identityService = inject(IdentityService)
  protected readonly landingService = inject(LandingService)
  private readonly _routerService = inject(Router)

  /**
   * SIGNALS AND OBSERVABLES
   */
  protected tokenExpLeftPercentage$ = this.identityService.tokenExpLeft$.pipe(
    map((value: number) => (value / environment.token.lifespan) * 100)
  )
  private routerEventSubscription: Subscription | undefined
  protected breadcrumbs = signal<string[]>(this.urlToBreadcrumbs(this._routerService.url))

  ngOnInit(): void {
    this.routerEventSubscription = this._routerService.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(navigation => {
        if (navigation instanceof NavigationEnd) {
          let segments = this.urlToBreadcrumbs(navigation.urlAfterRedirects)
          this.breadcrumbs.set(
            segments.length > 2 ? [segments.at(0) ?? '??', '..', segments.at(-1) ?? '??'] : segments
          )
        }
      })
  }

  ngOnDestroy(): void {
    this.routerEventSubscription?.unsubscribe()
  }

  /**
   * FUNCTIONS
   */
  private urlToBreadcrumbs(url: string): string[] {
    return url
      .split('/')
      .splice(2)
      .filter(v => v !== 'home')
  }
}
