import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';

import { coreReducers } from 'ish-core/store/core-store.module';
import { ngrxTesting } from 'ish-core/utils/dev/ngrx-testing';
import { LoadingComponent } from 'ish-shared/components/common/loading/loading.component';

import { UserProfileFormComponent } from '../../shared/user/user-profile-form/user-profile-form.component';

import { UsersEditProfilePageComponent } from './users-edit-profile-page.component';

describe('Users Edit Profile Page Component', () => {
  let component: UsersEditProfilePageComponent;
  let fixture: ComponentFixture<UsersEditProfilePageComponent>;
  let element: HTMLElement;
  let fb: FormBuilder;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        ngrxTesting({ reducers: coreReducers }),
      ],
      declarations: [
        MockComponent(LoadingComponent),
        MockComponent(UserProfileFormComponent),
        UsersEditProfilePageComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersEditProfilePageComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fb = TestBed.inject(FormBuilder);

    component.user = {
      title: 'Mr.',
      firstName: 'Bernhard',
      lastName: 'Boldner',
      preferredLanguage: 'en_US',
      email: 'test@gmail.com',
    };

    component.profile = fb.group({
      profile: fb.group({
        title: [component.user.title, [Validators.required]],
        firstName: [component.user.firstName, [Validators.required]],
        lastName: [component.user.lastName, [Validators.required]],
        preferredLanguage: [component.user.preferredLanguage, [Validators.required]],
      }),
    });
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should submit a valid form when the user fills all required fields', () => {
    fixture.detectChanges();

    expect(component.formDisabled).toBeFalse();
    component.submitForm();
    expect(component.formDisabled).toBeFalse();
  });
});
