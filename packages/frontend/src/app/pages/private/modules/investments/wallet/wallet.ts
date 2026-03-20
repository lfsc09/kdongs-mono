import { DatePipe } from '@angular/common'
import { Component, inject, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { IndexWalletResponse } from '@kdongs/domain/dto/investment/wallet/wallet-dto'
import { combineLatest, debounceTime, Subscription, switchMap, tap } from 'rxjs'
import { MonetaryDirective } from '../../../../../infra/directives/monetary.directive'
import { InvestmentsGatewayService } from '../../../../../infra/gateways/investments/investments-gateway.service'
import { MonetaryPipe } from '../../../../../infra/pipes/monetary.pipe'
import { PercentPipe } from '../../../../../infra/pipes/percent.pipe'
import { Datatable } from '../../../components/datatable/datatable'
import { LoadingBar } from '../../../components/loading-bar/loading-bar'

@Component({
  selector: 'kdongs-wallet',
  templateUrl: './wallet.html',
  imports: [RouterLink, LoadingBar, DatePipe, MonetaryPipe, PercentPipe, MonetaryDirective],
})
export class Wallet extends Datatable implements OnDestroy {
  /**
   * SERVICES
   */
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected wallets = signal<IndexWalletResponse['wallets'] | null | undefined>(undefined)

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    super(25)

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
          this.wallets.set(response.data.wallets)
          this.currPage.set(response.metadata.page)
          this.pageSize.set(response.metadata.limit)
          this.totalItems.set(response.metadata.totalCount)
          this.totalPages.set(response.metadata.totalPages)
          this.pageControls.set({
            next: response.metadata.nextPage ?? null,
            previous: response.metadata.previousPage ?? null,
            first: response.metadata.totalPages > 0 && response.metadata.page > 1 ? 1 : null,
            last:
              response.metadata.totalPages > 0 &&
              response.metadata.page < response.metadata.totalPages
                ? response.metadata.totalPages
                : null,
          })
          this.loading.set(false)
        },
        error: () => {
          this.wallets.set(null)
          this.currPage.set(1)
          this.pageSize.set(this.defaultPageSize)
          this.totalItems.set(0)
          this.totalPages.set(0)
          this.pageControls.set({
            next: null,
            previous: null,
            first: null,
            last: null,
          })
          this.loading.set(false)
        },
      })
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
  }
}
