import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeManagerService } from './infra/services/theme/theme-manager.service';
import { ZardToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZardToastComponent],
  template: `
    <router-outlet />
    <z-toaster />
  `,
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
