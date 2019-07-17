import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { mapToQueryParam, ofRoute } from 'ngrx-router';
import { EMPTY, Observable, merge, of } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  filter,
  map,
  mapTo,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { CustomerRegistrationType } from 'ish-core/models/customer/customer.model';
import { PersonalizationService } from 'ish-core/services/personalization/personalization.service';
import {
  mapErrorToAction,
  mapToPayload,
  mapToPayloadProperty,
  mapToProperty,
  whenTruthy,
} from 'ish-core/utils/operators';
import { HttpErrorMapper } from '../../models/http-error/http-error.mapper';
import { UserService } from '../../services/user/user.service';
import { GeneralError } from '../error';

import * as userActions from './user.actions';
import { getLoggedInCustomer, getLoggedInUser, getUserError, getUserSuccessMessage } from './user.selectors';

function mapUserErrorToActionIfPossible<T>(specific) {
  return (source$: Observable<T>) =>
    source$.pipe(
      // tslint:disable-next-line:ban
      catchError(error =>
        of(
          error.headers.has('error-key')
            ? new specific({ error: HttpErrorMapper.fromError(error) })
            : new GeneralError({ error: HttpErrorMapper.fromError(error) })
        )
      )
    );
}

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<{}>,
    private userService: UserService,
    private personalizationService: PersonalizationService,
    private router: Router
  ) {}

  @Effect()
  loginUser$ = this.actions$.pipe(
    ofType<userActions.LoginUser>(userActions.UserActionTypes.LoginUser),
    mapToPayloadProperty('credentials'),
    mergeMap(credentials =>
      this.userService.signinUser(credentials).pipe(
        map(data => new userActions.LoginUserSuccess(data)),
        mapUserErrorToActionIfPossible(userActions.LoginUserFail)
      )
    )
  );

  @Effect()
  loadCompanyUser$ = this.actions$.pipe(
    ofType(userActions.UserActionTypes.LoadCompanyUser),
    mergeMap(() =>
      this.userService.getCompanyUserData().pipe(
        map(user => new userActions.LoadCompanyUserSuccess({ user })),
        mapErrorToAction(userActions.LoadCompanyUserFail)
      )
    )
  );

  @Effect({ dispatch: false })
  goToHomeAfterLogout$ = this.actions$.pipe(
    ofType(userActions.UserActionTypes.LogoutUser),
    tap(() => this.router.navigate(['/home']))
  );

  /*
   * redirects to the returnUrl after successful login
   * does not redirect at all, if no returnUrl is defined
   */
  @Effect({ dispatch: false })
  redirectAfterLogin$ = merge(
    this.actions$.pipe(
      ofType(userActions.UserActionTypes.LoginUserSuccess),
      map(() => this.router.routerState),
      mapToProperty('snapshot'),
      whenTruthy(),
      map(snapshot => snapshot.root.queryParams.returnUrl as string)
    ),
    this.actions$.pipe(
      ofRoute('login'),
      mapToQueryParam<string>('returnUrl'),
      map(returnUrl => returnUrl || '/account'),
      switchMap(returnUrl =>
        this.store$.pipe(
          select(getLoggedInUser),
          whenTruthy(),
          mapTo(returnUrl)
        )
      )
    )
  ).pipe(
    whenTruthy(),
    tap(navigateTo => this.router.navigateByUrl(navigateTo))
  );

  @Effect()
  createUser$ = this.actions$.pipe(
    ofType<userActions.CreateUser>(userActions.UserActionTypes.CreateUser),
    mapToPayload(),
    mergeMap((data: CustomerRegistrationType) =>
      this.userService.createUser(data).pipe(
        // TODO:see #IS-22750 - user should actually be logged in after registration
        map(() => new userActions.LoginUser({ credentials: data.credentials })),
        mapUserErrorToActionIfPossible(userActions.CreateUserFail)
      )
    )
  );

  @Effect()
  updateUser$ = this.actions$.pipe(
    ofType<userActions.UpdateUser>(userActions.UserActionTypes.UpdateUser),
    mapToPayload(),
    withLatestFrom(this.store$.pipe(select(getLoggedInCustomer))),
    concatMap(([payload, customer]) =>
      this.userService.updateUser({ user: payload.user, customer }).pipe(
        map(
          changedUser =>
            new userActions.UpdateUserSuccess({ user: changedUser, successMessage: payload.successMessage })
        ),
        mapErrorToAction(userActions.UpdateUserFail)
      )
    )
  );

  @Effect()
  updateUserPassword$ = this.actions$.pipe(
    ofType<userActions.UpdateUserPassword>(userActions.UserActionTypes.UpdateUserPassword),
    mapToPayload(),
    withLatestFrom(this.store$.pipe(select(getLoggedInCustomer))),
    concatMap(([payload, customer]) =>
      this.userService.updateUserPassword(customer, payload.password).pipe(
        mapTo(
          new userActions.UpdateUserPasswordSuccess({
            successMessage: payload.successMessage || 'account.profile.update_password.message',
          })
        ),
        mapErrorToAction(userActions.UpdateUserPasswordFail)
      )
    )
  );

  @Effect()
  updateCustomer$ = this.actions$.pipe(
    ofType<userActions.UpdateCustomer>(userActions.UserActionTypes.UpdateCustomer),
    mapToPayload(),
    withLatestFrom(this.store$.pipe(select(getLoggedInCustomer))),
    filter(([, loggedInCustomer]) => !!loggedInCustomer && loggedInCustomer.isBusinessCustomer),
    concatMap(([payload]) =>
      this.userService.updateCustomer(payload.customer).pipe(
        map(
          changedCustomer =>
            new userActions.UpdateCustomerSuccess({ customer: changedCustomer, successMessage: payload.successMessage })
        ),
        mapErrorToAction(userActions.UpdateCustomerFail)
      )
    )
  );

  /* ToDo: should be partly replaced by the toast implementation */
  /* Navigates the user to the Accouont Profile page and deletes the update user success message from store after 5 sec */
  @Effect()
  resetUpdateUserSuccessMessage$ = this.actions$.pipe(
    ofType(
      userActions.UserActionTypes.UpdateUserPasswordSuccess,
      userActions.UserActionTypes.UpdateUserSuccess,
      userActions.UserActionTypes.UpdateCustomerSuccess
    ),
    withLatestFrom(this.store$.pipe(select(getUserSuccessMessage))),
    filter(([, successMessage]) => !!successMessage),
    tap(() => this.router.navigateByUrl('/account/profile')),
    delay(5000),
    mapTo(new userActions.UserSuccessMessageReset())
  );

  @Effect()
  resetUserError$ = this.actions$.pipe(
    ofRoute(),
    withLatestFrom(this.store$.pipe(select(getUserError))),
    filter(([, error]) => !!error),
    mapTo(new userActions.UserErrorReset())
  );

  @Effect()
  loadCompanyUserAfterLogin$ = this.actions$.pipe(
    ofType<userActions.LoginUserSuccess>(userActions.UserActionTypes.LoginUserSuccess),
    mapToPayload(),
    filter(payload => payload.customer.isBusinessCustomer),
    mapTo(new userActions.LoadCompanyUser())
  );

  @Effect()
  loadUserByAPIToken$ = this.actions$.pipe(
    ofType<userActions.LoadUserByAPIToken>(userActions.UserActionTypes.LoadUserByAPIToken),
    mapToPayloadProperty('apiToken'),
    concatMap(apiToken =>
      this.userService.signinUserByToken(apiToken).pipe(map(user => new userActions.LoginUserSuccess(user)))
    )
  );

  @Effect()
  fetchPGID$ = this.actions$.pipe(
    ofType(userActions.UserActionTypes.LoginUserSuccess),
    switchMap(() =>
      this.personalizationService.getPGID().pipe(
        map(pgid => new userActions.SetPGID({ pgid })),
        // tslint:disable-next-line:ban
        catchError(() => EMPTY)
      )
    )
  );
}
