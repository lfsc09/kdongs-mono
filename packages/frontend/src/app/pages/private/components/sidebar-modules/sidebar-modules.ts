import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { IdentityService } from '../../../../infra/services/identity/identity.service'
import { ThemeManagerService } from '../../../../infra/services/theme/theme-manager.service'
import { LandingService } from '../../landing.service'

@Component({
  selector: 'kdongs-cp-sidebar-modules',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './sidebar-modules.html',
  host: {
    '(document:keyup.Escape)': 'landingService.handleCollapse()',
    '(document:keyup.Control.;)': 'handleInputFocus()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarModules implements AfterViewInit {
  /**
   * SERVICES
   */
  protected readonly identityService = inject(IdentityService)
  protected readonly themeManagerService = inject(ThemeManagerService)
  protected readonly landingService = inject(LandingService)
  private readonly _routerService = inject(Router)

  ngAfterViewInit(): void {
    this.runInputRef()?.nativeElement.focus()
  }

  /**
   * SIGNALS
   */
  protected runInput = new FormControl('')
  protected runInputRef = viewChild<ElementRef<HTMLInputElement>>('runInputRef')
  protected runError = signal<string>('')

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
      this.identityService.clearAll()
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
        this.landingService.isExecutableRoute(
          this._routerService.createUrlTree(execRoute).toString()
        )
      ) {
        this._routerService.navigate(execRoute)
        this.landingService.handleCollapse()
      } else this.runError.set('Invalid Command!')
    }
  }
}
