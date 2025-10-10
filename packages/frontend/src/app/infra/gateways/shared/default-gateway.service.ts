import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AdonisJSError, GatewayError } from './default-gateway.model';
import { z } from 'zod';

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
  protected handleHttpError<T extends z.ZodTypeAny>(error: unknown, responseSchema: T): void {
    let message = '';
    let description = '';
    let status: number | undefined;

    // Check if it's an HTTP error from backend
    if (error instanceof HttpErrorResponse) {
      status = error.status;
      const result = responseSchema.safeParse(error.error);

      if (
        status === 422 &&
        result.success &&
        result.data &&
        typeof result.data === 'object' &&
        'errors' in result.data &&
        result.data.errors
      ) {
        message = `Validation Error${(result.data.errors as AdonisJSError).length > 1 ? 's' : ''}`;
        (result.data.errors as AdonisJSError).forEach((err, idx) => {
          description += `  [${idx + 1}] ${err.message}\n`;
        });
      } else if (
        status === 500 &&
        result.success &&
        result.data &&
        typeof result.data === 'object' &&
        'errors' in result.data &&
        result.data.errors
      ) {
        message = 'Server Error';
        description = (result.data.errors as AdonisJSError).map((err) => err.message).join('\n');
      } else if (status >= 400 && status < 600) {
        message = `Backend Error (${status})`;
        description = error.message;
      } else {
        message = `Unexpected Backend Response (${status})`;
        description = error.message;
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
