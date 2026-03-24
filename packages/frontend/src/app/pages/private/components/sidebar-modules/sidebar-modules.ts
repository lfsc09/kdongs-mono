import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { Subscription } from 'rxjs'
import { LogoutGatewayService } from '../../../../infra/gateways/logout/logout-gateway.service'
import { GatewayError } from '../../../../infra/gateways/shared/default-gateway.model'
import { IdentityService } from '../../../../infra/services/identity/identity.service'
import { ThemeManagerService } from '../../../../infra/services/theme/theme-manager.service'
import { SidebarModulesService } from './sidebar-modules.service'

@Component({
  selector: 'kdongs-cp-sidebar-modules',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './sidebar-modules.html',
  providers: [LogoutGatewayService],
  host: {
    '(document:keyup.Escape)': 'sidebarModulesService.handleCollapse()',
    '(document:keyup.Control.;)': 'handleInputFocus()',
    'animate.leave': 'animate-fade-out',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarModules implements AfterViewInit, OnDestroy {
  /**
   * SERVICES
   */
  protected readonly identityService = inject(IdentityService)
  protected readonly themeManagerService = inject(ThemeManagerService)
  protected readonly sidebarModulesService = inject(SidebarModulesService)
  private readonly _logoutService = inject(LogoutGatewayService)
  private readonly _routerService = inject(Router)

  /**
   * SIGNALS
   */
  protected runInput = new FormControl('')
  protected runInputRef = viewChild<ElementRef<HTMLInputElement>>('runInputRef')
  protected runError = signal<string>('')

  /**
   * VARS
   */
  private _logoutSubscription: Subscription | undefined

  ngAfterViewInit(): void {
    this.runInputRef()?.nativeElement.focus()
  }

  ngOnDestroy(): void {
    this._logoutSubscription?.unsubscribe()
  }

  /**
   * FUNCTIONS
   */
  handleInputFocus() {
    this.runInputRef()?.nativeElement.focus()
  }

  handleEnter() {
    if (!this.runInput.value) return

    const segments = (this.runInput.value ?? '')
      .trim()
      .split(' ')
      .filter(v => !!v)

    if (segments.length === 1 && segments[0] === 'logout') {
      this.handleLogout()
      return
    } else if (segments.length === 1 && segments[0] === 'light') {
      this.themeManagerService.setTheme('light')
      this.runInput.reset('')
      this.runError.set('')
    } else if (segments.length === 1 && segments[0] === 'dark') {
      this.themeManagerService.setTheme('dark')
      this.runInput.reset('')
      this.runError.set('')
    } else {
      const execRoute = ['/r!', ...segments]
      if (
        this.sidebarModulesService.isExecutableRoute(
          this._routerService.createUrlTree(execRoute).toString()
        )
      ) {
        this._routerService.navigate(execRoute)
        this.sidebarModulesService.handleCollapse()
      } else this.runError.set('Invalid Command!')
    }
  }

  protected handleLogout() {
    this._logoutSubscription = this._logoutService.execute().subscribe({
      next: () => {
        this.identityService.clearAll()
        this._routerService.navigate(['/gate'])
      },
      error: (error: Error | GatewayError) => {
        console.error(error)
      },
    })
  }
}
