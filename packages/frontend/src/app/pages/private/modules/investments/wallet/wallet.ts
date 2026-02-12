import { DatePipe } from '@angular/common'
import { Component, inject, linkedSignal, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { combineLatest, debounceTime, Subscription, switchMap } from 'rxjs'
import { ListUserWalletDTO } from '../../../../../infra/gateways/investments/investments-gateway.model'
import { InvestmentsGatewayService } from '../../../../../infra/gateways/investments/investments-gateway.service'
import { MonetaryPipe } from '../../../../../infra/pipes/monetary.pipe'
import { PercentPipe } from '../../../../../infra/pipes/percent.pipe'
import { LoadingBar } from '../../../components/loading-bar/loading-bar'
import { InvestmentsService } from '../investments.service'
import { LocalSelectableWallets } from './wallet.model'

@Component({
  selector: 'kdongs-wallet',
  templateUrl: './wallet.html',
  imports: [RouterLink, DatePipe, MonetaryPipe, PercentPipe, LoadingBar],
  host: {
    'animate.leave': 'animate-fade-out',
  },
})
export class Wallet implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly investmentsService = inject(InvestmentsService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected wallets = signal<ListUserWalletDTO[] | null | undefined>(undefined)
  protected localSelectedWallets = linkedSignal<LocalSelectableWallets>(() =>
    this.investmentsService
      .selectedWalletIds()
      .reduce((map, walletId) => map.set(walletId, null), new Map() as LocalSelectableWallets)
  )
  private navPage = signal<number>(1)
  private pageSize = signal<number>(10)

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    const page$ = toObservable(this.navPage)
    const pageSize$ = toObservable(this.pageSize)

    this._investmentsSubscription = combineLatest([page$, pageSize$])
      .pipe(
        debounceTime(150),
        switchMap(([page, pageSize]) => {
          this.loading.set(true)
          return this._investmentsGatewayService.listUserWallets({ page, limit: pageSize })
        })
      )
      .subscribe({
        next: response => {
          this.wallets.set(response.data.wallets)
          if (this.localSelectedWallets().size === 0) {
            const latestWalletId = response.data.wallets.at(0)?.id ?? null
            this.handleUpdateLocalSelectedWallets(latestWalletId ? [latestWalletId] : [])
          }
          this.loading.set(false)
        },
        error: () => {
          this.wallets.set(null)
          this.handleUpdateLocalSelectedWallets([])
          this.loading.set(false)
        },
      })
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
    this.handleUpdateSelectedWallets()
  }

  /**
   * FUNCTIONS
   */
  protected handleSelectMoreWallets(event: MouseEvent, selectedWalletId: string): void {
    // Selecting multiple wallets with Ctrl
    if (event.ctrlKey) {
      let selectedWalletIds: string[]
      // Figure it out if must add or remove
      if (this.localSelectedWallets().has(selectedWalletId)) {
        if (this.localSelectedWallets().size === 1) {
          // If only one wallet was selected, do nothing on remove (must have at least one)
          return
        }
        selectedWalletIds = Array.from(this.localSelectedWallets().keys()).filter(
          walletId => walletId !== selectedWalletId
        )
      } else {
        selectedWalletIds = [...Array.from(this.localSelectedWallets().keys()), selectedWalletId]
      }
      this.handleUpdateLocalSelectedWallets(selectedWalletIds)
    } else this.handleUpdateLocalSelectedWallets([selectedWalletId])
  }

  /**
   * Update the in memory Map of the local selected wallets.
   */
  private handleUpdateLocalSelectedWallets(selectedWalletsIds: string[]): void {
    if (selectedWalletsIds.length === 0) {
      this.localSelectedWallets.set(new Map())
      return
    }
    let newLocalSelectedWalletMap = new Map() as LocalSelectableWallets
    for (let selectedWalletId of selectedWalletsIds)
      newLocalSelectedWalletMap.set(selectedWalletId, null)
    this.localSelectedWallets.set(newLocalSelectedWalletMap)
  }

  /**
   * Checks if the local selected wallets have changed compared to the currently selected wallets.
   */
  private didSelectedWalletsChange(): boolean {
    if (this.localSelectedWallets().size !== this.investmentsService.selectedWalletIds().length)
      return true
    for (const key of this.localSelectedWallets().keys()) {
      if (!this.investmentsService.selectedWalletIds().includes(key)) return true
    }
    return false
  }

  /**
   * Updates the globally selected wallets in the WalletService if there are changes.
   * This avoids unnecessary updates and potential re-renders, in other components that depend on the selected wallets.
   */
  private handleUpdateSelectedWallets(): void {
    if (!this.didSelectedWalletsChange() || !this.wallets()) {
      return
    }
    const newSelectedWalletIds: string[] = Array.from(this.localSelectedWallets().keys())
    this.investmentsService.handleSelectedWalletIdsChange(newSelectedWalletIds)
  }
}
