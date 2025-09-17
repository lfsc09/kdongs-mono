import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { IdentityService } from 'src/app/infra/services/identity/identity.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing-layout',
  template: ` <router-outlet /> `,
  imports: [RouterOutlet],
  // host: {
  //   '(document:keyup.Control.m)': 'navMenuService.handleOpen()',
  // },
})
export class LandingLayout implements OnInit, OnDestroy {
  /**
   * SERVICES
   */
  // protected readonly navMenuService = inject(NavMenuService);
  private readonly _identityService = inject(IdentityService);
  private readonly _routerService = inject(Router);

  /**
   * SIGNALS AND OBSERVABLES
   */
  private _tokenExpLeftSubscription: Subscription | undefined;
  private _clearTimeoutProcessToken: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this._tokenExpLeftSubscription = this._identityService.tokenExpLeft$.subscribe(
      (expLeft: number) => {
        if (expLeft > 0) {
          this._clearTimeoutProcessToken = setTimeout(() => {
            if (!this._identityService.processIdentity()) this._routerService.navigate(['/gate']);
          }, environment.token.interval);
        } else this._routerService.navigate(['/gate']);
      },
    );
  }

  ngOnDestroy(): void {
    this._tokenExpLeftSubscription?.unsubscribe();
    clearTimeout(this._clearTimeoutProcessToken);
  }
}
