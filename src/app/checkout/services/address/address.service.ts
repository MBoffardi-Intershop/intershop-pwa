import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

import { ApiService, resolveLink, resolveLinks, unpackEnvelope } from '../../../core/services/api/api.service';
import { AddressMapper } from '../../../models/address/address.mapper';
import { Address } from '../../../models/address/address.model';
import { Link } from '../../../models/link/link.model';

/**
 * The Address Service handles the interaction with the REST API concerning addresses.
 */
@Injectable({ providedIn: 'root' })
export class AddressService {
  constructor(private apiService: ApiService) {}

  /**
   * Gets the addresses for the given customer id. Falls back to '-' as customer id to get the addresses for the current user.
   * @param customerId  The customer id.
   * @returns           The customer's addresses.
   */
  getCustomerAddresses(customerId: string = '-'): Observable<Address[]> {
    return this.apiService.get(`customers/${customerId}/addresses`).pipe(
      unpackEnvelope<Link>(),
      resolveLinks<Address>(this.apiService),
      map(addressesData => addressesData.map(AddressMapper.fromData))
    );
  }

  /**
   * Creates an address for the given customer id. Falls back to '-' as customer id if no customer id is given
   * @param customerId  The customer id.
   * @param address     The address which should be created
   * @returns           The new customer's address.
   */
  createCustomerAddress(customerId: string = '-', address: Address): Observable<Address> {
    return this.apiService.post(`customers/${customerId}/addresses`, address).pipe(
      resolveLink<Address>(this.apiService),
      map(AddressMapper.fromData)
    );
  }

  /**
   * Deletes an address for the given customer id. Falls back to '-' as customer id if no customer id is given
   * @param customerId  The customer id.
   * @param address     The address id
   */
  deleteCustomerAddress(customerId: string = '-', addressId: string): Observable<string> {
    return this.apiService.delete(`customers/${customerId}/addresses/${addressId}`).pipe(mapTo(addressId));
  }
}
