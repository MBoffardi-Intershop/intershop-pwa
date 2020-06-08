import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { AppFacade } from 'ish-core/facades/app.facade';
import { Locale } from 'ish-core/models/locale/locale.model';
import { User } from 'ish-core/models/user/user.model';
import { whenTruthy } from 'ish-core/utils/operators';
import { determineSalutations, markAsDirtyRecursive } from 'ish-shared/forms/utils/form-utils';

import { OrganizationManagementFacade } from '../../facades/organization-management.facade';

@Component({
  selector: 'ish-users-edit-profile-page',
  templateUrl: './users-edit-profile-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersEditProfilePageComponent implements OnInit {
  currentLocale$: Observable<Locale>;
  loading$: Observable<boolean>;

  profile: FormGroup;
  titles: string[];
  currentCountryCode = '';
  user: User;
  submitted = false;

  constructor(
    private appFacade: AppFacade,
    private fb: FormBuilder,
    private organizationManagementFacade: OrganizationManagementFacade
  ) {}

  ngOnInit() {
    this.currentLocale$ = this.appFacade.currentLocale$;
    this.loading$ = this.organizationManagementFacade.usersLoading$;

    this.currentLocale$.pipe(whenTruthy(), take(1)).subscribe(locale => {
      this.currentCountryCode = locale.lang.slice(3);
      this.titles = locale.lang ? determineSalutations(this.currentCountryCode) : undefined;
    });

    this.organizationManagementFacade.currentUser$.pipe(whenTruthy(), take(1)).subscribe(user => {
      this.user = user;
      this.editUserProfileForm(user);
    });
  }

  editUserProfileForm(userProfile: User) {
    this.profile = this.fb.group({
      title: [userProfile.title, [Validators.required]],
      firstName: [userProfile.firstName, [Validators.required]],
      lastName: [userProfile.lastName, [Validators.required]],
      department: [userProfile.department],
      phone: [userProfile.phoneHome],
      fax: [userProfile.fax],
      birthday: [userProfile.birthday],
      preferredLanguage: [userProfile.preferredLanguage, [Validators.required]],
    });
  }

  submitForm() {
    if (this.profile.invalid) {
      markAsDirtyRecursive(this.profile);
      return;
    }

    const formValue = this.profile.value;

    const user: User = {
      title: formValue.title,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: this.user.email,
      department: formValue.department,
      phoneHome: formValue.phone,
      fax: formValue.fax,
      birthday: formValue.birthday === '' ? undefined : formValue.birthday, // TODO: see IS-22276
      preferredLanguage: formValue.preferredLanguage,
      businessPartnerNo: this.user.businessPartnerNo,
    };
    this.organizationManagementFacade.updateUser(user);
  }

  get formDisabled() {
    return this.profile.invalid && this.submitted;
  }
}
