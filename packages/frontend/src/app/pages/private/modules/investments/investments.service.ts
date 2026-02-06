import { Injectable, signal } from '@angular/core'
import { Currency, SelectableCurrency, UserPreferences } from './investments.model'

@Injectable()
export class InvestmentsService {
  /**
   * SIGNALS
   */
  walletSidebarCollapsed = signal<boolean>(true)
  selectedWalletIds = signal<string[]>([])
  selectedCurrency = signal<SelectableCurrency>('Wallet')
  currencyToShow = signal<Currency | undefined>(undefined)

  //
  // FIXME: Esse calculo sera feito no backend
  //
  // currencyOnUse = computed<Currency>(() => {
  //   // Default to BRL
  //   if (this.selectedCurrency() === null || this.selectedWallets().size === 0) return 'BRL';
  //   // Determine the most frequent currency among selected wallets if multiple wallets are selected, or the selected wallet's currency
  // 	else if (this.selectedCurrency() === 'Wallet') {
  // 		let moreFrequentCurrency: { [key: string]: number } = {};
  // 		this.selectedWallets().forEach((sWValue) => {
  // 			if (!(sWValue!.currency in moreFrequentCurrency)) moreFrequentCurrency[sWValue!.currency] = 0;
  // 			moreFrequentCurrency[sWValue!.currency] += 1;
  // 		});
  // 		return Object.entries(moreFrequentCurrency).reduce((highest, curr) => (curr[1] > highest[1] ? curr : highest))[0] as Currency;
  // 	}
  //   // Otherwise, use the selected currency
  // 	return this.selectedCurrency() as Currency;
  // })

  /**
   * FUNCTIONS
   */
  handleWalletSidebarCollapse(): void {
    this.walletSidebarCollapsed.update(current => !current)
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
    const preferences = localStorage.getItem('investments-preferences')

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
      'investments-preferences',
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
