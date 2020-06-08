import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { CustomValidators } from 'ng2-validation';
import { instance, mock } from 'ts-mockito';

import { coreReducers } from 'ish-core/store/core-store.module';
import { ngrxTesting } from 'ish-core/utils/dev/ngrx-testing';
import { LoadingComponent } from 'ish-shared/components/common/loading/loading.component';

import { OrganizationManagementFacade } from '../../facades/organization-management.facade';
import { UserEditProfileComponent } from '../../shared/user-edit-profile/user-edit-profile.component';

import { UsersCreatePageComponent } from './users-create-page.component';

describe('Users Create Page Component', () => {
  let component: UsersCreatePageComponent;
  let fixture: ComponentFixture<UsersCreatePageComponent>;
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
        MockComponent(UserEditProfileComponent),
        UsersCreatePageComponent,
      ],
      providers: [
        { provide: OrganizationManagementFacade, useFactory: () => instance(mock(OrganizationManagementFacade)) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersCreatePageComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should submit a valid form when the user fills all required fields', () => {
    fixture.detectChanges();

    component.form = fb.group({
      profile: fb.group({
        title: ['Mr.', [Validators.required]],
        firstName: ['Bernhard', [Validators.required]],
        lastName: ['Boldner', [Validators.required]],
        login: ['test@gmail.com', [Validators.required, CustomValidators.email]],
        email: ['test@gmail.com', [Validators.required, CustomValidators.email]],
        preferredLanguage: ['en_US', [Validators.required]],
      }),
    });

    expect(component.formDisabled).toBeFalse();
    component.submitForm();
    expect(component.formDisabled).toBeFalse();
  });

  it('should disable submit button when the user submits an invalid form', () => {
    fixture.detectChanges();

    expect(component.formDisabled).toBeFalse();
    component.submitForm();
    expect(component.formDisabled).toBeTrue();
  });
});
