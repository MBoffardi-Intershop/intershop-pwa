export class AddToOrderTemplateModule {
  constructor(private contextSelector: string = 'ish-product-listing') {}

  addProductToOrderTemplateFromPage(title: string = '', modal: boolean = false) {
    if (modal) {
      cy.get(`[data-testing-id="${title}"]`).click();
      cy.get('[class="modal-footer"] button.btn-primary').click();
    }
    this.closeAddProductToOrderTemplateModal('link');
  }

  addProductToOrderTemplateFromList(product: string, title: string, modal: boolean = true) {
    if (modal) {
      cy.get(this.contextSelector)
        .find(`ish-product-item div[data-testing-sku="${product}"] button.add-to-order-template`)
        .click();
      cy.get(`[data-testing-id="${title}"]`).click();
      cy.get('[class="modal-footer"] button.btn-primary').click();
      this.closeAddProductToOrderTemplateModal('link');
    } else {
      cy.get(this.contextSelector)
        .find(`ish-product-item div[data-testing-sku="${product}"] button.add-to-order-template`)
        .click();
      this.closeAddProductToOrderTemplateModal('link');
    }
  }

  private closeAddProductToOrderTemplateModal(mode: 'link' | 'x') {
    cy.wait(500);
    mode === 'link'
      ? cy.get('[data-testing-id="order-template-success-link"] a').click()
      : cy.get('[class="modal-header"] button').click();
  }
}
