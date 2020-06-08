import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersCreatePageComponent } from './users-create/users-create-page.component';
import { UsersDetailPageComponent } from './users-detail/users-detail-page.component';
import { UsersEditProfilePageComponent } from './users-edit-profile/users-edit-profile-page.component';
import { UsersPageComponent } from './users/users-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: UsersPageComponent },
  { path: 'users/:businessPartnerNo', component: UsersDetailPageComponent },
  { path: 'users/create/new', component: UsersCreatePageComponent },
  { path: 'users/:businessPartnerNo/edit/profile', component: UsersEditProfilePageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationManagementRoutingModule {}
