import { Injectable } from '@angular/core';
import { DefaultGatewayService } from '../shared/default-gateway.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  ListUserWalletRequestDTO,
  ListUserWalletResponseDTO,
  ListUserWalletResponseDTOSchema,
} from './investments-gateway.model';
import { GatewayError } from '../shared/default-gateway.model';

@Injectable()
export class InvestmentsGatewayService extends DefaultGatewayService {
  listUserWallets(request: ListUserWalletRequestDTO): Observable<ListUserWalletResponseDTO> {
    return this.http
      .get<ListUserWalletResponseDTO>(`${this.apiUrl}/investments/wallets`, {
        observe: 'response',
        withCredentials: true,
        params: request,
      })
      .pipe(
        map((response) => {
          const validationResult = ListUserWalletResponseDTOSchema.safeParse(response.body);

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map((e) => e.message).join(', '),
              'Invalid authentication response structure',
            );
          }

          return validationResult.data;
        }),
        catchError((error) => {
          return throwError(() => this.handleHttpError(error));
        }),
      );
  }
}
