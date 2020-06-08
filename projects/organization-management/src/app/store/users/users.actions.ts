import { Action } from '@ngrx/store';

import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { User } from 'ish-core/models/user/user.model';

export enum UsersActionTypes {
  LoadUsers = '[Users] Load Users',
  LoadUsersFail = '[Users API] Load Users Fail',
  LoadUsersSuccess = '[Users API] Load Users Success',
  AddUser = '[Users] Add User',
  AddUserFail = '[Users API] Add User Fail',
  AddUserSuccess = '[Users API] Add User Success',
  UpdateUser = '[Users] Update User',
  UpdateUserFail = '[Users API] Update User Fail',
  UpdateUserSuccess = '[Users API] Update User Success',
  DeleteUser = '[Users] Delete User',
  DeleteUserFail = '[Users API] Delete User Fail',
  DeleteUserSuccess = '[Users API] Delete User Success',
}

export class LoadUsers implements Action {
  readonly type = UsersActionTypes.LoadUsers;
}

export class LoadUsersFail implements Action {
  readonly type = UsersActionTypes.LoadUsersFail;
  constructor(public payload: { error: HttpError }) {}
}

export class LoadUsersSuccess implements Action {
  readonly type = UsersActionTypes.LoadUsersSuccess;
  constructor(public payload: { users: User[] }) {}
}

export class AddUser implements Action {
  readonly type = UsersActionTypes.AddUser;
  constructor(public payload: { user: User; successMessage?: string; successRouterLink?: string }) {}
}

export class AddUserFail implements Action {
  readonly type = UsersActionTypes.AddUserFail;
  constructor(public payload: { error: HttpError }) {}
}

export class AddUserSuccess implements Action {
  readonly type = UsersActionTypes.AddUserSuccess;
  constructor(public payload: { newUser: User; successMessage?: string }) {}
}

export class UpdateUser implements Action {
  readonly type = UsersActionTypes.UpdateUser;
  constructor(public payload: { user: User; successMessage?: string; successRouterLink?: string }) {}
}

export class UpdateUserFail implements Action {
  readonly type = UsersActionTypes.UpdateUserFail;
  constructor(public payload: { error: HttpError }) {}
}

export class UpdateUserSuccess implements Action {
  readonly type = UsersActionTypes.UpdateUserSuccess;
  constructor(public payload: { user: User; successMessage?: string }) {}
}

export class DeleteUser implements Action {
  readonly type = UsersActionTypes.DeleteUser;
  constructor(public payload: { user: User }) {}
}

export class DeleteUserFail implements Action {
  readonly type = UsersActionTypes.DeleteUserFail;
  constructor(public payload: { error: HttpError }) {}
}

export class DeleteUserSuccess implements Action {
  readonly type = UsersActionTypes.DeleteUserSuccess;
  constructor(public payload: { user: User }) {}
}

export type UsersAction =
  | LoadUsers
  | LoadUsersFail
  | LoadUsersSuccess
  | AddUser
  | AddUserFail
  | AddUserSuccess
  | UpdateUser
  | UpdateUserFail
  | UpdateUserSuccess
  | DeleteUser
  | DeleteUserFail
  | DeleteUserSuccess;
