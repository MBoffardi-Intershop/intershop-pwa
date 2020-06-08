import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { CustomerUserType } from 'ish-core/models/customer/customer.model';
import { Link } from 'ish-core/models/link/link.model';
import { UserData } from 'ish-core/models/user/user.interface';
import { UserMapper } from 'ish-core/models/user/user.mapper';
import { User } from 'ish-core/models/user/user.model';
import { ApiService, resolveLinks, unpackEnvelope } from 'ish-core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private apiService: ApiService) {}

  getUsers() {
    return this.apiService.get(`customers/-/users`).pipe(
      unpackEnvelope<Link>(),
      resolveLinks<UserData>(this.apiService),
      map(users => users.map(UserMapper.fromData))
    );
  }

  deleteUser(customerItemUserKey: string) {
    if (!customerItemUserKey) {
      return throwError('deleteUser() called without customerItemUserKey');
    }

    return this.apiService.delete(`customers/-/users/${customerItemUserKey}`);
  }

  addUser(body: CustomerUserType): Observable<User> {
    if (!body || !body.customer || !body.user) {
      return throwError('addUser() called without required body data');
    }

    if (!body.customer.type) {
      return throwError('addUser() called without required customer type (PrivateCustomer/SMBCustomer)');
    }

    return this.apiService
      .post<User>(`customers/${body.customer.customerNo}/users`, {
        type: 'SMBCustomerUserCollection',
        name: 'Users',
        elements: [
          {
            ...body.customer,
            ...body.user,
            preferredInvoiceToAddress: { urn: body.user.preferredInvoiceToAddressUrn },
            preferredShipToAddress: { urn: body.user.preferredShipToAddressUrn },
            preferredPaymentInstrument: { id: body.user.preferredPaymentInstrumentId },
            preferredInvoiceToAddressUrn: undefined,
            preferredShipToAddressUrn: undefined,
            preferredPaymentInstrumentId: undefined,
          },
        ],
      })
      .pipe(map(UserMapper.fromData));
  }

  updateUser(customerItemUserKey: string, body: CustomerUserType): Observable<User> {
    if (!body || !body.customer || !body.user) {
      return throwError('updateUser() called without required body data');
    }

    if (!body.customer.type) {
      return throwError('updateUser() called without required customer type (PrivateCustomer/SMBCustomer)');
    }

    return this.apiService
      .put<User>(`customers/${body.customer.customerNo}/users/${customerItemUserKey}`, {
        ...body.customer,
        ...body.user,
        preferredInvoiceToAddress: { urn: body.user.preferredInvoiceToAddressUrn },
        preferredShipToAddress: { urn: body.user.preferredShipToAddressUrn },
        preferredPaymentInstrument: { id: body.user.preferredPaymentInstrumentId },
        preferredInvoiceToAddressUrn: undefined,
        preferredShipToAddressUrn: undefined,
        preferredPaymentInstrumentId: undefined,
      })
      .pipe(map(UserMapper.fromData));
  }
}
