import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { concatMap, exhaustMap, map, tap, withLatestFrom } from 'rxjs/operators';

import { getLoggedInCustomer } from 'ish-core/store/user';
import { mapErrorToAction, mapToPayload, mapToPayloadProperty } from 'ish-core/utils/operators';

import { UsersService } from '../../services/users/users.service';

import * as actions from './users.actions';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private store: Store,
    private router: Router
  ) {}

  @Effect()
  loadUsers$ = this.actions$.pipe(
    ofType<actions.LoadUsers>(actions.UsersActionTypes.LoadUsers),
    exhaustMap(() =>
      this.usersService
        .getUsers()
        .pipe(map(users => new actions.LoadUsersSuccess({ users }), mapErrorToAction(actions.LoadUsersFail)))
    )
  );

  @Effect()
  addUser$ = this.actions$.pipe(
    ofType<actions.AddUser>(actions.UsersActionTypes.AddUser),
    mapToPayload(),
    withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
    concatMap(([payload, customer]) =>
      this.usersService.addUser({ user: payload.user, customer }).pipe(
        tap(() => {
          if (payload.successRouterLink) {
            this.router.navigateByUrl(payload.successRouterLink);
          }
        }),
        map(
          newUser => new actions.AddUserSuccess({ newUser, successMessage: payload.successMessage }),
          mapErrorToAction(actions.AddUserFail)
        )
      )
    )
  );

  @Effect()
  updateUser$ = this.actions$.pipe(
    ofType<actions.UpdateUser>(actions.UsersActionTypes.UpdateUser),
    mapToPayload(),
    withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
    concatMap(([payload, customer]) =>
      this.usersService.updateUser(payload.user.email, { user: payload.user, customer }).pipe(
        tap(() => {
          if (payload.successRouterLink) {
            this.router.navigateByUrl(payload.successRouterLink);
          }
        }),
        map(
          user => new actions.UpdateUserSuccess({ user, successMessage: payload.successMessage }),
          mapErrorToAction(actions.UpdateUserFail)
        )
      )
    )
  );

  @Effect()
  deleteUser$ = this.actions$.pipe(
    ofType<actions.DeleteUser>(actions.UsersActionTypes.DeleteUser),
    mapToPayloadProperty('user'),
    exhaustMap(user =>
      this.usersService
        .deleteUser(user.email)
        .pipe(map(() => new actions.DeleteUserSuccess({ user }), mapErrorToAction(actions.DeleteUserFail)))
    )
  );
}
