import { NgModule } from '@angular/core';

import { SharedModule } from 'ish-shared/shared.module';

import { OrganizationManagementRoutingModule } from './pages/organization-management-routing.module';
import { UsersCreatePageComponent } from './pages/users-create/users-create-page.component';
import { UsersDetailPageComponent } from './pages/users-detail/users-detail-page.component';
import { UsersPageComponent } from './pages/users/users-page.component';
import { UserEditProfileComponent } from './shared/user-edit-profile/user-edit-profile.component';
import { OrganizationManagementStoreModule } from './store/organization-management-store.module';
import { UsersEditProfilePageComponent } from './pages/users-edit-profile/users-edit-profile-page.component';

@NgModule({
  declarations: [
    UserEditProfileComponent,
    UsersCreatePageComponent,
    UsersDetailPageComponent,
    UsersPageComponent,
    UsersEditProfilePageComponent,
  ],
  imports: [OrganizationManagementRoutingModule, OrganizationManagementStoreModule, SharedModule],
})
export class OrganizationManagementModule {}
