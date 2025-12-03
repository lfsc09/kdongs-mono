import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { WalletService } from './wallet.service';
import { LoadingSpinner } from '../../../../components/loading-spinner/loading-spinner';
import { ListUserWalletDTO } from '../../../../../infra/gateways/investments/investments-gateway.model';
import { InvestmentsGatewayService } from '../../../../../infra/gateways/investments/investments-gateway.service';
import { Subscription } from 'rxjs';
import { SelectableWalletsMap_Key, SelectableWalletsMap_Value } from './wallet.model';
import { DatePipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'kdongs-wallet',
  templateUrl: './wallet.html',
  imports: [RouterLink, DatePipe, CurrencyPipe, PercentPipe, LoadingSpinner],
})
export class Wallet implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly walletService = inject(WalletService);
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService);

  /**
   * SINGNALS
   */
  protected loading = signal<boolean>(false);
  protected wallets = signal<ListUserWalletDTO[] | null | undefined>(undefined);

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined;

  constructor() {
    effect(() => {
      this.loading.set(true);
      this._investmentsSubscription = this._investmentsGatewayService
        .listUserWallets({ page: 1, limit: 100 })
        .subscribe({
          next: (response) => {
            this.wallets.set(response.data.wallets);
            if (this.walletService.possibleSelectedWallets().size === 0) {
              const latestWalletId = response.data.wallets.at(0)?.id ?? null;
              this.handleUpdateSelectedWallets(latestWalletId ? [latestWalletId] : []);
            }
            this.loading.set(false);
          },
          error: () => {
            this.wallets.set(null);
            this.walletService.resetSelectedWallets();
            this.loading.set(false);
          },
        });
    });
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe();
  }

  /**
   * FUNCTIONS
   */
  protected handleSelectMoreWallets(event: MouseEvent, selectedWalletId: string): void {
    // Selecting multiple wallets with Ctrl
    if (event.ctrlKey) {
      let selectedWalletIds: string[];
      // Figure it out if must add or remove
      if (this.walletService.possibleSelectedWallets().has(selectedWalletId)) {
        selectedWalletIds = Array.from(this.walletService.possibleSelectedWallets().keys()).filter(
          (walletId) => walletId !== selectedWalletId,
        );
      } else {
        selectedWalletIds = [
          ...Array.from(this.walletService.possibleSelectedWallets().keys()),
          selectedWalletId,
        ];
      }
      this.handleUpdateSelectedWallets(selectedWalletIds);
    } else this.handleUpdateSelectedWallets([selectedWalletId]);
  }

  /**
   * Checks if the selected wallets have changed and updates the lastSelectedWalletState signal.
   */
  protected handleOnHide(): void {
    if (this.walletService.didSelectedWalletsChange()) {
      let selectedWalletMap = new Map<SelectableWalletsMap_Key, SelectableWalletsMap_Value>();
      if (this.wallets()!.length > 0) {
        for (let selectedWalletId of this.walletService.possibleSelectedWallets().keys()) {
          const wallet_idx = this.wallets()!.findIndex((wallet) => wallet.id === selectedWalletId);
          selectedWalletMap.set(selectedWalletId, {
            currency: this.wallets()![wallet_idx].currencyCode,
          });
        }
      }
      // At initial load, will not have wallets data to calculate percentages
      else {
        for (let selectedWalletId of this.walletService.possibleSelectedWallets().keys())
          selectedWalletMap.set(selectedWalletId, null);
      }
      this.walletService.selectedWallets.set(selectedWalletMap);
    }
  }

  /**
   * Update the in memory Map of the possible selected wallets, which are the selected wallets before the dialog was closed.
   * This Map will have the wallet_id as the key `SelectableWalletsMap_Key`, and an object as value `SelectableWalletsMap_Value`.
   */
  private handleUpdateSelectedWallets(selectedWalletsIds: string[]): void {
    if (this.wallets() === null || selectedWalletsIds.length === 0) {
      this.walletService.resetSelectedWallets();
      return;
    }
    let selectedWalletMap = new Map<SelectableWalletsMap_Key, null>();
    for (let selectedWalletId of selectedWalletsIds) selectedWalletMap.set(selectedWalletId, null);
    this.walletService.possibleSelectedWallets.set(selectedWalletMap);
  }
}
