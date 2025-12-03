import { Injectable, signal } from '@angular/core'
import {
  PossibleSelectableWallets,
  SelectableWallets,
  SelectableWalletsMap_Key,
  SelectableWalletsMap_Value,
} from './wallet.model'

@Injectable()
export class WalletService {
  /**
   * SIGNAL
   */
  sidebarCollapsed = signal<boolean>(false)
  possibleSelectedWallets = signal<PossibleSelectableWallets>(
    new Map<SelectableWalletsMap_Key, null>()
  )
  selectedWallets = signal<SelectableWallets>(
    new Map<SelectableWalletsMap_Key, SelectableWalletsMap_Value>()
  )

  /**
   * FUNCTIONS
   */
  handleCollapse(): void {
    this.sidebarCollapsed.update(current => !current)
  }

  resetSelectedWallets(): void {
    this.possibleSelectedWallets.set(new Map<SelectableWalletsMap_Key, null>())
    this.selectedWallets.set(new Map<SelectableWalletsMap_Key, SelectableWalletsMap_Value>())
  }

  didSelectedWalletsChange(): boolean {
    if (this.possibleSelectedWallets().size !== this.selectedWallets().size) return true
    for (const key of this.possibleSelectedWallets().keys()) {
      if (!this.selectedWallets().has(key)) return true
    }
    return false
  }
}
