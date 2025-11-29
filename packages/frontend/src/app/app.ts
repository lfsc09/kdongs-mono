import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeManagerService } from './infra/services/theme/theme-manager.service';

@Component({
  selector: 'kdongs-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
})
export class App {
  /**
   * SERVICES
   */
  private readonly _themeManagerService = inject(ThemeManagerService);
  private readonly _documentService = inject(DOCUMENT);

  constructor() {
    effect(() => {
      this._documentService.documentElement.classList.toggle(
        'dark',
        this._themeManagerService.isDarkTheme(),
      );
    });
  }
}
