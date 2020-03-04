import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { debounceTime, distinctUntilChanged, filter, map, mapTo, mergeMap, switchMap, take, tap } from 'rxjs/operators';

import {
  DEFAULT_PRODUCT_LISTING_VIEW_TYPE,
  PRODUCT_LISTING_ITEMS_PER_PAGE,
} from 'ish-core/configurations/injection-keys';
import { ProductListingMapper } from 'ish-core/models/product-listing/product-listing.mapper';
import { ProductCompletenessLevel, ProductHelper } from 'ish-core/models/product/product.model';
import { ViewType } from 'ish-core/models/viewtype/viewtype.types';
import { ProductMasterVariationsService } from 'ish-core/services/product-master-variations/product-master-variations.service';
import { selectQueryParam, selectQueryParams } from 'ish-core/store/router';
import {
  ApplyFilter,
  LoadFilterForCategory,
  LoadFilterForSearch,
  LoadFilterSuccess,
  LoadProductsForFilter,
} from 'ish-core/store/shopping/filter';
import { LoadProductsForCategory, getProduct } from 'ish-core/store/shopping/products';
import { SearchProducts } from 'ish-core/store/shopping/search';
import { mapToPayload, whenFalsy, whenTruthy } from 'ish-core/utils/operators';

import * as actions from './product-listing.actions';
import { getProductListingView, getProductListingViewType } from './product-listing.selectors';

@Injectable()
export class ProductListingEffects {
  constructor(
    @Inject(PRODUCT_LISTING_ITEMS_PER_PAGE) private itemsPerPage: number,
    @Inject(DEFAULT_PRODUCT_LISTING_VIEW_TYPE) private defaultViewType: ViewType,
    private actions$: Actions,
    private store: Store,
    private productListingMapper: ProductListingMapper,
    private productMasterVariationsService: ProductMasterVariationsService
  ) {}

  @Effect()
  initializePageSize$ = this.actions$.pipe(
    take(1),
    mapTo(new actions.SetProductListingPageSize({ itemsPerPage: this.itemsPerPage }))
  );

  @Effect()
  initializeDefaultViewType$ = this.store.pipe(
    select(getProductListingViewType),
    whenFalsy(),
    mapTo(new actions.SetViewType({ viewType: this.defaultViewType }))
  );

  @Effect()
  setViewTypeFromQueryParam$ = this.store.pipe(
    select(selectQueryParam('view')),
    whenTruthy(),
    distinctUntilChanged(),
    map((viewType: ViewType) => new actions.SetViewType({ viewType }))
  );

  @Effect()
  determineParams$ = this.actions$.pipe(
    ofType<actions.LoadMoreProducts>(actions.ProductListingActionTypes.LoadMoreProducts),
    mapToPayload(),
    switchMap(({ id, page }) =>
      this.store.pipe(
        select(selectQueryParams),
        debounceTime(0),
        map(params => {
          const filters = params.get('filters')
            ? {
                ...params.filters,
                ...(id.type === 'search' ? { searchTerm: [id.value] } : {}),
              }
            : undefined;
          return {
            id: { ...id, filters },
            sorting: params.sorting || undefined,
            page: +params.page || page || undefined,
            filters,
          };
        })
      )
    ),
    distinctUntilChanged(isEqual),
    tap(x => console.log('determineParams', x)),
    map(({ id, filters, sorting, page }) => new actions.LoadMoreProductsForParams({ id, filters, sorting, page }))
  );

  @Effect()
  loadMoreProducts$ = this.actions$.pipe(
    ofType<actions.LoadMoreProductsForParams>(actions.ProductListingActionTypes.LoadMoreProductsForParams),
    mapToPayload(),
    switchMap(({ id, sorting, page, filters }) =>
      this.store.pipe(
        select(getProductListingView, { ...id, sorting, filters }),
        map(view => ({ id, sorting, page, filters, viewAvailable: !view.empty() && view.productsOfPage(page).length }))
      )
    ),
    distinctUntilChanged((a, b) => isEqual({ ...a, viewAvailable: undefined }, { ...b, viewAvailable: undefined })),
    tap(x => console.log('loadMoreProducts$', x)),
    map(({ id, sorting, page, filters, viewAvailable }) => {
      if (viewAvailable) {
        return new actions.SetProductListingPages({ id: { sorting, filters, ...id } });
      }
      if (
        filters &&
        // TODO: work-around for different products/hits-result without filters
        (id.type !== 'search' || this.isSearchFor(filters.searchTerm, id)) &&
        // TODO: work-around for client side computation of master variations
        ['search', 'category'].includes(id.type)
      ) {
        return new LoadProductsForFilter({ id: { ...id }, searchParameter: filters });
      } else {
        switch (id.type) {
          case 'category':
            return new LoadProductsForCategory({ categoryId: id.value, page, sorting });
          case 'search':
            return new SearchProducts({ searchTerm: id.value, page, sorting });
          case 'master':
            return new actions.LoadPagesForMaster({ id, sorting, filters });
          default:
            return;
        }
      }
    }),
    whenTruthy(),
    distinctUntilChanged(isEqual)
  );

  @Effect()
  loadFilters$ = this.actions$.pipe(
    ofType<actions.LoadMoreProductsForParams>(actions.ProductListingActionTypes.LoadMoreProductsForParams),
    mapToPayload(),
    map(({ id, filters }) => ({ type: id.type, value: id.value, filters })),
    distinctUntilChanged(isEqual),
    map(({ type, value, filters }) => {
      if (
        filters &&
        // TODO: work-around for different products/hits-result without filters
        (type !== 'search' || this.isSearchFor(filters.searchTerm, { type, value })) &&
        // TODO: work-around for client side computation of master variations
        ['search', 'category'].includes(type)
      ) {
        return new ApplyFilter({ searchParameter: filters });
      } else {
        switch (type) {
          case 'category':
            return new LoadFilterForCategory({ uniqueId: value });
          case 'search':
            return new LoadFilterForSearch({ searchTerm: value });
          case 'master':
            return new actions.LoadPagesForMaster({ id: { type, value }, sorting: undefined, filters });
          default:
            return;
        }
      }
    }),
    whenTruthy()
  );

  // TODO: work-around for client side computation of master variations
  @Effect()
  loadPagesForMaster$ = this.actions$.pipe(
    ofType<actions.LoadPagesForMaster>(actions.ProductListingActionTypes.LoadPagesForMaster),
    mapToPayload(),
    switchMap(({ id, filters }) =>
      this.store.pipe(
        select(getProduct, { sku: id.value }),
        filter(p => ProductHelper.isSufficientlyLoaded(p, ProductCompletenessLevel.Detail)),
        filter(ProductHelper.hasVariations),
        filter(ProductHelper.isMasterProduct),
        take(1),
        mergeMap(product => {
          const {
            filterNavigation,
            products,
          } = this.productMasterVariationsService.getFiltersAndFilteredVariationsForMasterProduct(product, filters);

          return [
            new actions.SetProductListingPages(
              this.productListingMapper.createPages(products, id.type, id.value, {
                filters: filters ? filters : undefined,
              })
            ),
            new LoadFilterSuccess({ filterNavigation }),
          ];
        })
      )
    )
  );

  private isSearchFor(searchTerm: string[], id: { type: string; value: string }): boolean {
    return id.type === 'search' && searchTerm && searchTerm.includes(id.value);
  }
}
