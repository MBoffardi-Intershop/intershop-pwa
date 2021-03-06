import { createReducer, on } from '@ngrx/store';

import { Customer } from 'ish-core/models/customer/customer.model';
import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { PaymentMethod } from 'ish-core/models/payment-method/payment-method.model';
import { User } from 'ish-core/models/user/user.model';
import { setErrorOn, setLoadingOn } from 'ish-core/utils/ngrx-creators';

import {
  createUser,
  createUserFail,
  deleteUserPaymentInstrument,
  deleteUserPaymentInstrumentFail,
  deleteUserPaymentInstrumentSuccess,
  loadCompanyUser,
  loadCompanyUserFail,
  loadCompanyUserSuccess,
  loadUserPaymentMethods,
  loadUserPaymentMethodsFail,
  loadUserPaymentMethodsSuccess,
  loginUser,
  loginUserFail,
  loginUserSuccess,
  logoutUser,
  requestPasswordReminder,
  requestPasswordReminderFail,
  requestPasswordReminderSuccess,
  resetAPIToken,
  resetPasswordReminder,
  setAPIToken,
  setPGID,
  updateCustomer,
  updateCustomerFail,
  updateCustomerSuccess,
  updateUser,
  updateUserFail,
  updateUserPassword,
  updateUserPasswordByPasswordReminder,
  updateUserPasswordByPasswordReminderFail,
  updateUserPasswordByPasswordReminderSuccess,
  updateUserPasswordFail,
  updateUserPasswordSuccess,
  updateUserSuccess,
  userErrorReset,
} from './user.actions';

export interface UserState {
  customer: Customer;
  user: User;
  authorized: boolean;
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: HttpError;
  pgid: string;
  passwordReminderSuccess: boolean;
  passwordReminderError: HttpError;
  // not synced via state transfer
  authToken: string;
  lastAuthTokenBeforeLogin: string;
}

export const initialState: UserState = {
  customer: undefined,
  user: undefined,
  authorized: false,
  paymentMethods: undefined,
  loading: false,
  error: undefined,
  pgid: undefined,
  passwordReminderSuccess: undefined,
  passwordReminderError: undefined,
  authToken: undefined,
  lastAuthTokenBeforeLogin: undefined,
};

export const userReducer = createReducer(
  initialState,
  on(userErrorReset, (state: UserState) => ({
    ...state,
    error: undefined,
  })),
  on(loginUser, (state: UserState) => ({
    ...initialState,
    authToken: state.authToken,
    lastAuthTokenBeforeLogin: state.authToken,
  })),
  on(logoutUser, () => initialState),
  on(setAPIToken, (state: UserState, action) => ({
    ...state,
    authToken: action.payload.apiToken,
  })),
  on(resetAPIToken, (state: UserState) => ({
    ...state,
    authToken: undefined,
  })),
  setLoadingOn(
    loadCompanyUser,
    createUser,
    updateUser,
    updateUserPassword,
    updateCustomer,
    loadUserPaymentMethods,
    deleteUserPaymentInstrument
  ),
  on(loginUserFail, loadCompanyUserFail, createUserFail, (state: UserState, action) => {
    const error = action.payload.error;

    return {
      ...initialState,
      loading: false,
      error,
      authToken: state.authToken,
    };
  }),
  setErrorOn(
    updateUserFail,
    updateUserPasswordFail,
    updateCustomerFail,
    loadUserPaymentMethodsFail,
    deleteUserPaymentInstrumentFail
  ),
  on(loginUserSuccess, (state: UserState, action) => {
    const customer = action.payload.customer;
    const user = action.payload.user;

    return {
      ...state,
      authorized: true,
      customer,
      user,
      loading: false,
      error: undefined,
    };
  }),
  on(loadCompanyUserSuccess, (state: UserState, action) => {
    const user = action.payload.user;

    return {
      ...state,
      user,
      loading: false,
      error: undefined,
    };
  }),
  on(updateUserSuccess, (state: UserState, action) => {
    const user = action.payload.user;

    return {
      ...state,
      user,
      loading: false,
      error: undefined,
    };
  }),
  on(updateUserPasswordSuccess, (state: UserState) => ({
    ...state,
    loading: false,
    error: undefined,
  })),
  on(updateCustomerSuccess, (state: UserState, action) => {
    const customer = action.payload.customer;

    return {
      ...state,
      customer,
      loading: false,
      error: undefined,
    };
  }),
  on(setPGID, (state: UserState, action) => ({
    ...state,
    pgid: action.payload.pgid,
  })),
  on(loadUserPaymentMethodsSuccess, (state: UserState, action) => ({
    ...state,
    paymentMethods: action.payload.paymentMethods,
    loading: false,
    error: undefined,
  })),
  on(deleteUserPaymentInstrumentSuccess, (state: UserState) => ({
    ...state,
    loading: false,
    error: undefined,
  })),
  on(updateUserPasswordByPasswordReminder, requestPasswordReminder, (state: UserState) => ({
    ...state,
    loading: true,
    passwordReminderSuccess: undefined,
    passwordReminderError: undefined,
  })),
  on(updateUserPasswordByPasswordReminderSuccess, requestPasswordReminderSuccess, (state: UserState) => ({
    ...state,
    loading: false,
    passwordReminderSuccess: true,
    passwordReminderError: undefined,
  })),
  on(updateUserPasswordByPasswordReminderFail, requestPasswordReminderFail, (state: UserState, action) => ({
    ...state,
    loading: false,
    passwordReminderSuccess: false,
    passwordReminderError: action.payload.error,
  })),
  on(resetPasswordReminder, (state: UserState) => ({
    ...state,
    passwordReminderSuccess: undefined,
    passwordReminderError: undefined,
  }))
);
