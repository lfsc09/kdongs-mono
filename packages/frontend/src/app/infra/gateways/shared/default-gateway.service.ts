import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import {
  AdonisJSError,
  AdonisJSPaginationResponse,
  AdonisJSResponse,
} from '@kdongs/domain/dto/shared/default-response-dto'
import { environment } from '../../../../environments/environment'
import { GatewayError } from './default-gateway.model'

export class DefaultGatewayService {
  /**
   * CONSTS
   */
  private readonly DEFAULT_MESSAGE = 'Gateway error raised'

  /**
   * SERVICES
   */
  protected readonly http = inject(HttpClient)

  /**
   * VARS
   */
  protected readonly apiUrl = environment.apiUrl

  /**
   * FUNCTIONS
   */
  protected parseResponse<T>(
    response: unknown
  ): AdonisJSResponse<T> | AdonisJSPaginationResponse<T> {
    if (typeof response === 'object' && response !== null && 'data' in response) {
      if ('errors' in response && this._isAdonisJSError(response.errors)) {
        throw new GatewayError(
          undefined,
          this.transformAdonisJSErrors(response.errors.errors),
          this.DEFAULT_MESSAGE
        )
      }
      if (
        'metadata' in response &&
        typeof response.metadata === 'object' &&
        response.metadata !== null
      ) {
        return response as AdonisJSPaginationResponse<T>
      }
      return response as AdonisJSResponse<T>
    } else {
      throw new GatewayError(
        undefined,
        'Unexpected response structure from backend',
        this.DEFAULT_MESSAGE
      )
    }
  }

  /**
   * Parses an error object and throws a GatewayError with appropriate status and description
   */
  protected parseError(e: unknown): void {
    let status: number | undefined
    let description = ''

    if (e instanceof HttpErrorResponse) {
      status = e.status
      if (this._isAdonisJSError(e.error)) {
        description = this.transformAdonisJSErrors(e.error.errors)
      } else {
        description = e.error.message
      }
    } else if (e instanceof Error) {
      description = e.message
    } else {
      description = String(e)
    }

    if (description) {
      throw new GatewayError(status, description, this.DEFAULT_MESSAGE)
    }
  }

  /**
   * Transforms an array of AdonisJS errors into a single string message
   */
  protected transformAdonisJSErrors(ae: AdonisJSError[]): string {
    if (ae.length === 1) {
      return ae[0].message
    } else {
      return ae.map((e, idx) => `  [${idx + 1}] ${e.message}`).join('\n')
    }
  }

  /**
   * Type guard to check if an error object matches the AdonisJS error structure
   */
  private _isAdonisJSError(error: unknown): error is { errors: AdonisJSError[] } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'errors' in error &&
      Array.isArray((error as { errors: AdonisJSError[] }).errors) &&
      (error as { errors: AdonisJSError[] }).errors.every(
        err =>
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string'
      )
    )
  }
}
