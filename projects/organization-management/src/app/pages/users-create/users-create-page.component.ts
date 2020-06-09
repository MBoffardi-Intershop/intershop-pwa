import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { AppFacade } from 'ish-core/facades/app.facade';
import { Locale } from 'ish-core/models/locale/locale.model';
import { User } from 'ish-core/models/user/user.model';
import { whenTruthy } from 'ish-core/utils/operators';
import { determineSalutations, markAsDirtyRecursive } from 'ish-shared/forms/utils/form-utils';

import { OrganizationManagementFacade } from '../../facades/organization-management.facade';

@Component({
  selector: 'ish-users-create-page',
  templateUrl: './users-create-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersCreatePageComponent implements OnInit {
  loading$: Observable<boolean>;
  currentLocale$: Observable<Locale>;

  titles: string[];
  currentCountryCode = '';
  form: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private organizationManagementFacade: OrganizationManagementFacade,
    private appFacade: AppFacade
  ) {}

  ngOnInit() {
    this.loading$ = this.organizationManagementFacade.usersLoading$;
    this.currentLocale$ = this.appFacade.currentLocale$;

    // determine default language from session and available locales
    this.currentLocale$.pipe(whenTruthy(), take(1)).subscribe(locale => {
      this.currentCountryCode = locale.lang.slice(3);
      this.titles = locale.lang ? determineSalutations(this.currentCountryCode) : undefined;
    });

    this.createAddUserForm();
  }

  createAddUserForm() {
    this.form = this.fb.group({
      profile: this.fb.group({
        title: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        login: ['', [Validators.required, CustomValidators.email]],
        email: ['', [Validators.required, CustomValidators.email]],
        department: [''],
        phone: [''],
        fax: [''],
        birthday: [''],
        preferredLanguage: ['en_US', [Validators.required]],
      }),
      rolesPermissions: this.fb.group({
        roles: [''],
        permissions: [''],
      }),
      budgetLimits: this.fb.group({
        orderSpentLimit: [''],
        budget: [''],
      }),
    });
  }

  get profile() {
    return this.form.get('profile');
  }

  submitForm() {
    if (this.form.invalid) {
      this.submitted = true;
      markAsDirtyRecursive(this.form);
      return;
    }

    const formValue = this.form.value;
    const businessPartnerUsername = formValue.profile.firstName.charAt(0) + formValue.profile.lastName;

    const user: User = {
      title: formValue.profile.title,
      firstName: formValue.profile.firstName,
      lastName: formValue.profile.lastName,
      email: formValue.profile.login,
      department: formValue.profile.department,
      phoneHome: formValue.profile.phone,
      fax: formValue.profile.fax,
      birthday: formValue.profile.birthday === '' ? undefined : formValue.birthday, // TODO: see IS-22276
      preferredLanguage: formValue.profile.preferredLanguage,
      businessPartnerNo: businessPartnerUsername.toLowerCase(),
    };

    this.organizationManagementFacade.addUser(user);
  }

  get formDisabled() {
    return this.form.invalid && this.submitted;
  }
}
