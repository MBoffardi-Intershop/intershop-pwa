import { NgModule } from '@angular/core';

import { SharedModule } from 'ish-shared/shared.module';

import { OrganizationManagementRoutingModule } from './pages/organization-management-routing.module';
import { UsersCreatePageComponent } from './pages/users-create/users-create-page.component';
import { UsersDetailPageComponent } from './pages/users-detail/users-detail-page.component';
import { UsersEditProfilePageComponent } from './pages/users-edit-profile/users-edit-profile-page.component';
import { UsersPageComponent } from './pages/users/users-page.component';
import { UserProfileFormComponent } from './shared/user/user-profile-form/user-profile-form.component';
import { OrganizationManagementStoreModule } from './store/organization-management-store.module';

@NgModule({
  declarations: [
    UserProfileFormComponent,
    UsersCreatePageComponent,
    UsersDetailPageComponent,
    UsersEditProfilePageComponent,
    UsersPageComponent,
  ],
  imports: [OrganizationManagementRoutingModule, OrganizationManagementStoreModule, SharedModule],
})
export class OrganizationManagementModule {}
