import { Injectable, signal } from '@angular/core'
import { Currency } from '../investments.model'
import { SelectableCurrency, UserPreferences } from './performance.model'

@Injectable()
export class PerformanceService {
  /**
   * SIGNALS
   */
  filterSidebarButtonEnabled = signal<boolean>(false)
  filterSidebarCollapsed = signal<boolean>(true)
  selectedWalletIds = signal<string[]>([])
  selectedCurrency = signal<SelectableCurrency>('Wallet')
  currencyToShow = signal<Currency | undefined>(undefined)

  /**
   * FUNCTIONS
   */
  handleFilterSidebarButtonEnabled(enabled: boolean): void {
    this.filterSidebarButtonEnabled.set(enabled)
  }

  handleFilterSidebarCollapse(): void {
    this.filterSidebarCollapsed.update(current => !current)
  }

  /**
   * Handle the change of selected wallet ids, updating the signal and writing to local storage if there was a change
   */
  handleSelectedWalletIdsChange(walletIds: string[]): void {
    if (walletIds.length > 0 && this.didSelectedWalletIdsChange(walletIds)) {
      this.selectedWalletIds.set(walletIds)
      this.writeUserPreferences()
    }
  }

  /**
   * Handle the change of selected currency, updating the signal and writing to local storage if there was a change
   */
  handleSelectedCurrencyChange(currency: SelectableCurrency): void {
    if (this.selectedCurrency() !== currency) {
      this.selectedCurrency.set(currency)
      this.writeUserPreferences()
    }
  }

  /**
   * Read from Local Storage the User Preferences
   */
  readUserPreferences(): void {
    const preferences = localStorage.getItem('performance-preferences')

    if (preferences) {
      const parsedPreferences: UserPreferences = JSON.parse(preferences)
      this.selectedWalletIds.set(parsedPreferences.selectedWallets)
      this.selectedCurrency.set(parsedPreferences.selectedCurrency)
    }
  }

  /**
   * Write to Local Storage the User Preferences
   */
  writeUserPreferences(): void {
    localStorage.setItem(
      'performance-preferences',
      JSON.stringify({
        selectedWallets: this.selectedWalletIds(),
        selectedCurrency: this.selectedCurrency(),
      } as UserPreferences)
    )
  }

  /**
   * Check if the selected wallet ids have changed compared to the current ones
   */
  private didSelectedWalletIdsChange(walletIds: string[]): boolean {
    const currentWalletIds = this.selectedWalletIds()
    if (currentWalletIds.length !== walletIds.length) return true
    return !currentWalletIds.every(walletId => walletIds.includes(walletId))
  }
}
