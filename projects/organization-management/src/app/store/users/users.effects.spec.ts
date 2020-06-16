import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { instance, mock, verify, when } from 'ts-mockito';

import { User } from 'ish-core/models/user/user.model';
import { ngrxTesting } from 'ish-core/utils/dev/ngrx-testing';

import { UsersService } from '../../services/users/users.service';

import * as actions from './users.actions';
import { UsersEffects } from './users.effects';

describe('Users Effects', () => {
  let actions$: Observable<Action>;
  let effects: UsersEffects;
  let usersService: UsersService;
  let store$: Store;

  beforeEach(() => {
    usersService = mock(UsersService);
    when(usersService.getUsers()).thenReturn(of([{ login: '1' }, { login: '2' }] as User[]));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ngrxTesting()],
      providers: [
        UsersEffects,
        provideMockActions(() => actions$),
        { provide: UsersService, useFactory: () => instance(usersService) },
      ],
    });

    effects = TestBed.inject(UsersEffects);
    store$ = TestBed.inject(Store);
  });

  describe('loadUsers$', () => {
    it('should call the service for retrieving users', done => {
      actions$ = of(new actions.LoadUsers());

      effects.loadUsers$.subscribe(() => {
        verify(usersService.getUsers()).once();
        done();
      });
    });

    it('should retrieve users when triggered', done => {
      actions$ = of(new actions.LoadUsers());

      effects.loadUsers$.subscribe(action => {
        expect(action).toMatchInlineSnapshot(`
          [Users API] Load Users Success:
            users: [{"login":"1"},{"login":"2"}]
        `);
        done();
      });
    });
  });

  describe('setOrderBreadcrumb$', () => {
    beforeEach(() => {
      store$.dispatch(new actions.LoadUsersSuccess({ users: [{ login: '1' }, { login: '2' }] }));
      // store$.dispatch(new actions.({login: "1"}));
    });

    // tslint:disable-next-line:no-disabled-tests
    xit('should set the breadcrumb of user detail', done => {
      effects.setUserDetailBreadcrumb$.subscribe(action => {
        expect(action.payload).toMatchInlineSnapshot(`

        `);
        done();
      });
    });
  });
});
