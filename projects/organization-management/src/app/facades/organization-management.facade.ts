import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { User } from 'ish-core/models/user/user.model';
import { getLoggedInCustomer } from 'ish-core/store/user';

import {
  AddUser,
  DeleteUser,
  LoadUsers,
  UpdateUser,
  getCurrentUser,
  getUsers,
  getUsersError,
  getUsersLoading,
} from '../store/users';

// tslint:disable:member-ordering
@Injectable({ providedIn: 'root' })
export class OrganizationManagementFacade {
  constructor(private store: Store) {}

  users$() {
    this.store.dispatch(new LoadUsers());
    return this.store.pipe(select(getUsers));
  }
  usersError$ = this.store.pipe(select(getUsersError));
  usersLoading$ = this.store.pipe(select(getUsersLoading));
  currentUser$ = this.store.pipe(select(getCurrentUser));
  customer$ = this.store.pipe(select(getLoggedInCustomer));

  addUser(user: User) {
    this.store.dispatch(
      new AddUser({
        user,
        successMessage: 'account.profile.update_profile.message',
        successRouterLink: '/account/organization/users',
      })
    );
  }

  updateUser(user: User) {
    this.store.dispatch(
      new UpdateUser({
        user,
        successMessage: 'account.profile.update_profile.message',
        successRouterLink: '/account/organization/users/' + user.businessPartnerNo,
      })
    );
  }

  deleteUser(user: User) {
    this.store.dispatch(new DeleteUser({ user }));
  }
}
