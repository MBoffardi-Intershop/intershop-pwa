import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LogoutGuard } from 'ish-core/guards/logout.guard';

const routes: Routes = [
  {
    path: 'register',
    loadChildren: './containers/registration-page/registration-page.module#RegistrationPageModule',
  },
  { path: 'login', loadChildren: './containers/login-page/login-page.module#LoginPageModule' },
  {
    path: 'logout',
    loadChildren: '../pages/home/home-page.module#HomePageModule',
    canActivate: [LogoutGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
