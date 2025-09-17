import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ThemeInfo, ThemeScheme } from './theme-manager.model';

@Injectable({
  providedIn: 'root',
})
export class ThemeManagerService {
  /**
   * SIGNALS
   */
  private _theme = signal<ThemeScheme>('light');
  theme = this._theme.asReadonly();

  /**
   * VARS
   */
  private readonly _themesAvailable: ThemeInfo[] = [
    { name: 'light', icon: 'pi pi-sun' },
    { name: 'dark', icon: 'pi pi-moon' },
  ];

  constructor() {
    const themeRead = localStorage.getItem(`theme:${environment.host}`);
    if (themeRead) this._theme.set(themeRead as ThemeScheme);
  }

  /**
   * FUNCTIONS
   */
  getUnselectedThemes(): ThemeScheme[] {
    return this._themesAvailable
      .filter((theme) => theme.name !== this._theme())
      .map((theme) => theme.name) as ThemeScheme[];
  }

  getNextThemeInfo(): ThemeInfo {
    const currentThemeIndex = this._themesAvailable.findIndex(
      (theme) => theme.name === this._theme(),
    );
    const nextThemeIndex = (currentThemeIndex + 1) % this._themesAvailable.length;
    return this._themesAvailable[nextThemeIndex];
  }

  cycleThrough(): void {
    this._theme.update((previous) => {
      if (previous === 'light') return 'dark';
      return 'light';
    });
    localStorage.setItem(`theme:${environment.host}`, this._theme());
  }

  setTheme(theme: ThemeScheme): void {
    this._theme.set(theme);
    localStorage.setItem(`theme:${environment.host}`, theme);
  }

  isDarkTheme(): boolean {
    return this._theme() === 'dark';
  }
}
