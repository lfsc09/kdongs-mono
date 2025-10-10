import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthenticatedUserDTO } from '../../gateways/login/login-gateway.model';
import { ModulePermissions, UserIdentity } from './identity.model';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  /**
   * SIGNALS
   */
  private _identity = signal<UserIdentity | null>(null);
  identity = this._identity.asReadonly();
  // In miliseconds
  private _tokenExpLeft$: BehaviorSubject<number> = new BehaviorSubject(0);
  tokenExpLeft$ = this._tokenExpLeft$.asObservable();

  /**
   * FUNCTIONS
   */
  /**
   * Processes the user identity, either from the local storage or from the provided user data.
   */
  processIdentity(user: AuthenticatedUserDTO | null = null): boolean {
    // In-memory user data
    if (user === null && this._identity() !== null) {
      if (!this._isValid(this._identity()?.tokenExp ?? 0)) {
        this.clearAll();
        return false;
      }
      this._tokenExpLeft$.next(this._calculateTokenExpLeft());
      return true;
    }

    const identityRead =
      user === null
        ? this._recoverUserIdentity()
        : { ...user, allowedIn: new Map(user.allowedIn.map((perm) => [perm, null])) };
    if (!this._isValid(identityRead?.tokenExp ?? 0)) {
      this.clearAll();
      return false;
    }

    this._identity.set(identityRead);

    if (user !== null) this._saveUserIdentity();
    this._tokenExpLeft$.next(this._calculateTokenExpLeft());
    return true;
  }

  clearAll(): void {
    if (this._identity() === null) return;
    this._identity.set(null);
    this._tokenExpLeft$.next(0);
    localStorage.removeItem(`userIdentity:${environment.host}`);
  }

  /**
   * Validates if the token expiration is still valid.
   */
  private _isValid(tokenExp: number): boolean {
    return tokenExp >= new Date().getTime();
  }

  /**
   * Calculates the time left for the user identity to expire, based on its token expiration.
   */
  private _calculateTokenExpLeft(): number {
    if (this._identity()) {
      const expLeft = (this.identity()!.tokenExp ?? 0) - new Date().getTime();
      return expLeft > 0 ? expLeft : 0;
    }
    return 0;
  }

  /**
   * Recovers the user identity from the local storage.
   */
  private _recoverUserIdentity(): UserIdentity | null {
    const userIdentityString = localStorage.getItem(`userIdentity:${environment.host}`);
    if (userIdentityString === null) return null;

    try {
      return JSON.parse(userIdentityString, (key: string, value: any) => {
        if (key === 'allowedIn')
          return new Map(value.map((perm: ModulePermissions) => [perm, null]));
        return value;
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Saves the user identity in the local storage.
   */
  private _saveUserIdentity(): void {
    if (this._identity() === null) return;
    localStorage.setItem(
      `userIdentity:${environment.host}`,
      JSON.stringify(this._identity(), (key: string, value: any) => {
        if (key === 'allowedIn') return Array.from(value.keys());
        return value;
      }),
    );
  }
}
