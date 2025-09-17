import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AdonisJSError } from './default-gateway.model';

export class DefaultGatewayService {
  /**
   * SERVICES
   */
  protected readonly http = inject(HttpClient);

  /**
   * VARS
   */
  protected readonly apiUrl = environment.apiUrl;

  /**
   * FUNCTIONS
   */
  protected extractErrors(errors: AdonisJSError): void {
    const errorsAmount = errors.length;
    throw new Error(
      `${errors.at(0)?.message ?? 'Unknown error'}${errorsAmount > 1 ? ` (+${errorsAmount - 1} error${errorsAmount - 1 > 1 ? 's' : ''})` : ''}`,
    );
  }
}
