import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeatureToggleGuard } from 'ish-core/feature-toggle.module';
import { AuthGuard } from 'ish-core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home-page.module#HomePageModule' },
  { path: 'error', loadChildren: './error/error-page.module#ErrorPageModule' },
  { path: 'product', loadChildren: './product/product-page.module#ProductPageModule' },
  { path: 'category', loadChildren: './category/category-page.module#CategoryPageModule' },
  {
    path: 'compare',
    loadChildren: './compare/compare-page.module#ComparePageModule',
    canActivate: [FeatureToggleGuard],
    data: { feature: 'compare' },
  },
  {
    path: 'recently',
    loadChildren: './recently/recently-page.module#RecentlyPageModule',
    canActivate: [FeatureToggleGuard],
    data: { feature: 'recently' },
  },
  { path: 'search', loadChildren: './search/search-page.module#SearchPageModule' },
  { path: 'basket', loadChildren: './basket/basket-page.module#BasketPageModule' },
  {
    path: 'checkout',
    loadChildren: './checkout/checkout-page.module#CheckoutPageModule',
    data: { headerType: 'checkout' },
    canActivate: [AuthGuard],
  },
  { path: 'page', loadChildren: './content/content-page.module#ContentPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always', scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
