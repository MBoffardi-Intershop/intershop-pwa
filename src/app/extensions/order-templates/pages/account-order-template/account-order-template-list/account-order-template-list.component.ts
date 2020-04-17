import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { ModalDialogComponent } from 'ish-shared/components/common/modal-dialog/modal-dialog.component';

import { ShoppingFacade } from 'ish-core/facades/shopping.facade';
import { OrderTemplate } from '../../../models/order-templates/order-template.model';

@Component({
  selector: 'ish-account-order-template-list',
  templateUrl: './account-order-template-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderTemplateListComponent implements OnChanges {
  /**
   * The list of order templates of the customer.
   */
  @Input() orderTemplates: OrderTemplate[];
  /**
   * Emits the id of the order template, which is to be deleted.
   */
  @Output() deleteOrderTemplate = new EventEmitter<string>();

  /** The header text of the delete modal. */
  deleteHeader: string;
  preferredOrderTemplate: OrderTemplate;

  constructor(private translate: TranslateService, private productFacade: ShoppingFacade) {}

  ngOnChanges() {
    // determine preferred order template
    this.preferredOrderTemplate =
      this.orderTemplates && this.orderTemplates.length
        ? this.orderTemplates.find(orderTemplates => orderTemplates.preferred)
        : undefined;
  }

  addTemplateToCart(orderTemplateId: string) {
    const products = this.orderTemplates.find(t => t.id === orderTemplateId).items;

    if (products.length > 0) {
      products.forEach(product => {
        this.productFacade.addProductToBasket(product.sku, product.desiredQuantity.value);
      });
    }
  }

  /** Emits the id of the order template to delete. */
  delete(orderTemplateId: string) {
    this.deleteOrderTemplate.emit(orderTemplateId);
  }

  /** Determine the heading of the delete modal and opens the modal. */
  openDeleteConfirmationDialog(orderTemplate: OrderTemplate, modal: ModalDialogComponent) {
    this.translate
      .get('modal.heading.remove.order.template', { 0: orderTemplate.title })
      .pipe(take(1))
      .subscribe(res => (modal.options.titleText = res));

    modal.show(orderTemplate.id);
  }
}
