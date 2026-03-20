import { DatePipe } from '@angular/common'
import { Component, inject, linkedSignal, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { IndexWalletResponse } from '@kdongs/domain/dto/investment/wallet/wallet-dto'
import { combineLatest, debounceTime, Subscription, switchMap, tap } from 'rxjs'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { MonetaryPipe } from '../../../../../../infra/pipes/monetary.pipe'
import { PercentPipe } from '../../../../../../infra/pipes/percent.pipe'
import { Datatable } from '../../../../components/datatable/datatable'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { PerformanceService } from '../performance.service'
import { LocalSelectableWallets } from './performance-filter.model'

@Component({
  selector: 'kdongs-performance-filter',
  templateUrl: './performance-filter.html',
  imports: [DatePipe, MonetaryPipe, PercentPipe, LoadingBar],
  host: {
    'animate.leave': 'animate-fade-out',
  },
})
export class PerformanceFilter extends Datatable implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly performanceService = inject(PerformanceService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected wallets = signal<IndexWalletResponse['wallets'] | null | undefined>(undefined)
  protected localSelectedWallets = linkedSignal<LocalSelectableWallets>(() =>
    this.performanceService
      .selectedWalletIds()
      .reduce((map, walletId) => map.set(walletId, null), new Map() as LocalSelectableWallets)
  )

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    super(10)

    const page$ = toObservable(this.currPage)
    const pageSize$ = toObservable(this.pageSize)

    this._investmentsSubscription = combineLatest([page$, pageSize$])
      .pipe(
        debounceTime(150),
        tap(() => this.loading.set(true)),
        switchMap(([page, pageSize]) => {
          return this._investmentsGatewayService.listUserWallets({ page, limit: pageSize })
        })
      )
      .subscribe({
        next: response => {
          const activeWallets = response.data.wallets.filter(wallet => wallet.isActive)
          this.wallets.set(activeWallets)
          if (this.localSelectedWallets().size === 0) {
            const latestWalletId = activeWallets.at(0)?.id ?? null
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
    if (this.localSelectedWallets().size !== this.performanceService.selectedWalletIds().length)
      return true
    for (const key of this.localSelectedWallets().keys()) {
      if (!this.performanceService.selectedWalletIds().includes(key)) return true
    }
    return false
  }

  /**
   * Updates the globally selected wallets in the PerformanceService if there are changes.
   * This avoids unnecessary updates and potential re-renders, in other components that depend on the selected wallets.
   */
  private handleUpdateSelectedWallets(): void {
    if (!this.didSelectedWalletsChange() || !this.wallets()) {
      return
    }
    const newSelectedWalletIds: string[] = Array.from(this.localSelectedWallets().keys())
    this.performanceService.handleSelectedWalletIdsChange(newSelectedWalletIds)
  }
}
