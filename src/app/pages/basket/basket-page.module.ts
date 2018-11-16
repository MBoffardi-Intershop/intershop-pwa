import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormsSharedModule } from '../../forms/forms-shared.module';
import { QuotingSharedModule } from '../../quoting/quoting-shared.module';
import { SharedModule } from '../../shared/shared.module';

import { BasketPageContainerComponent } from './basket-page.container';
import { ShoppingBasketEmptyComponent } from './components/shopping-basket-empty/shopping-basket-empty.component';
import { ShoppingBasketComponent } from './components/shopping-basket/shopping-basket.component';

const basketPageRoutes: Routes = [{ path: '', component: BasketPageContainerComponent }];

@NgModule({
  imports: [FormsSharedModule, QuotingSharedModule, RouterModule.forChild(basketPageRoutes), SharedModule],
  declarations: [BasketPageContainerComponent, ShoppingBasketComponent, ShoppingBasketEmptyComponent],
})
export class BasketPageModule {}
