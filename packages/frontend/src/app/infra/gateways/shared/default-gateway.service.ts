import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AdonisJSError, AdonisJSErrorSchema, GatewayError } from './default-gateway.model';

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
  protected handleHttpError(error: unknown): void {
    let message = '';
    let description = '';
    let status: number | undefined;

    // Check if it's an HTTP error from backend
    if (error instanceof HttpErrorResponse) {
      status = error.status;
      const errorParsed = AdonisJSErrorSchema.safeParse(error.error);
      let errorsFound = 0;

      if (!errorParsed.success) {
        description = error.message;
        errorsFound = 1;
      } else {
        errorsFound = errorParsed.data.errors.length;
        if (errorParsed.data.errors.length === 1) {
          description = errorParsed.data.errors[0].message;
        } else {
          errorParsed.data.errors.forEach((err, idx) => {
            description += `  [${idx + 1}] ${err.message}\n`;
          });
        }
      }

      if (status === 422) {
        message = `Validation Error${errorsFound > 1 ? 's' : ''}`;
      } else if (status === 500) {
        message = `Server Error${errorsFound > 1 ? 's' : ''}`;
      } else if (status >= 400 && status < 600) {
        message = `Backend Error${errorsFound > 1 ? 's' : ''} (${status})`;
      } else {
        message = `Unexpected Backend Response (${status})`;
      }
    } else {
      message = 'Network/Client Error';
      description = error instanceof Error ? error.message : String(error);
    }

    if (message && description) {
      throw new GatewayError(status, description, message);
    }
  }
}
