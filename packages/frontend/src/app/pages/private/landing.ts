import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardBreadcrumbModule } from '@shared/components/breadcrumb/breadcrumb.module';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { Subscription } from 'rxjs';
import { IdentityService } from 'src/app/infra/services/identity/identity.service';
import { environment } from 'src/environments/environment';
import { LandingService } from './landing.service';
import { ZardTooltipModule } from '@shared/components/tooltip/tooltip';
import { RouterLink } from '@angular/router';
import {
  ZardPopoverComponent,
  ZardPopoverDirective,
} from '@shared/components/popover/popover.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  imports: [
    RouterLink,
    LayoutModule,
    ZardButtonComponent,
    ZardBreadcrumbModule,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardTooltipModule,
    ZardAvatarComponent,
    ZardAvatarComponent,
    ZardPopoverDirective,
  ],
  providers: [LandingService],
  // host: {
  //   '(document:keyup.Control.m)': 'navMenuService.handleOpen()',
  // },
})
export class Landing implements OnInit, OnDestroy {
  /**
   * SERVICES
   */
  protected readonly landingService = inject(LandingService);
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

  /**
   * FUNCTIONS
   */
  toggleSidebar(): void {
    this.landingService.sidebarCollapsed.set(!this.landingService.sidebarCollapsed());
  }

  onCollapsedChange(collapsed: boolean): void {
    this.landingService.sidebarCollapsed.set(collapsed);
  }
}
