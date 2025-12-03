import { Component, DOCUMENT, effect, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ThemeManagerService } from './infra/services/theme/theme-manager.service'
import { MessageDocker } from './pages/components/message-manager/message-docker/message-docker'

@Component({
  selector: 'kdongs-root',
  imports: [RouterOutlet, MessageDocker],
  template: `
    <kdongs-cp-message-docker />
    <router-outlet />
  `,
})
export class App {
  /**
   * SERVICES
   */
  private readonly _themeManagerService = inject(ThemeManagerService)
  private readonly _documentService = inject(DOCUMENT)

  constructor() {
    effect(() => {
      this._documentService.documentElement.classList.toggle(
        'dark',
        this._themeManagerService.isDarkTheme()
      )
    })
  }
}
