import { HttpParams, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  takeUntil,
  debounceTime,
  lastValueFrom,
  forkJoin,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfirmBoxResult } from 'src/app/core-components/confirmation-box/confirmation-box.component';
import {
  Pagination,
  PaginationComponent,
} from 'src/app/core-components/pagination/pagination.component';
import { ControllerService } from 'src/app/services/controller.service';
import { MaskConfig } from 'src/app/services/core';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';
import { SellerService } from '../seller.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  /**
   * Data variables
   */
  private variantsChanges = new Map();
  productFormGroup: FormGroup = new FormGroup({
    products: new FormArray([]),
  });
  productCriFormGroup: FormGroup = new FormGroup({
    name: new FormControl(null),
    pageStyleGrid: new FormControl(true),
  });
  conditions: any = [];
  defaultVariants = new Map();
  pagination!: Pagination;

  /**
   * Layout variables
   */
  maskConfig: MaskConfig = this.http.config.mask;
  easyUpdate: boolean = false;
  /**
   * Const variables
   */

  constructor(
    public pgService: ControllerService,
    private http: ServerService,
    private fb: FormBuilder,
    private sellerService: SellerService,
    private popup: PopupService,
    private auth: AuthService
  ) {}

  get productVariationControls(): AbstractControl[] {
    return (<FormArray>this.productFormGroup.get('products')).controls;
  }
  get saveBtnOn() {
    return this.variantsChanges.size > 0;
  }
  get chnagedVariNumber() {
    return this.variantsChanges.size;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.init();

    this.productCriFormGroup
      .get('name')
      ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((changes: string) => {
        let params = new HttpParams();
        params = params.set('search', changes);
        lastValueFrom(this.getProducts(params))
          .then((result: any) => {
            if (result.success) {
              this.importProducts(result.details);
            }
          })
          .catch(() => {
            return null;
          });
      });
  }

  async init() {
    const getProducts = this.getProducts();
    const getConditions = this.sellerService.getConditionList();

    await lastValueFrom(forkJoin([getProducts, getConditions]))
      .then((values: any[]) => {
        if (values[0] && values[0].success) {
          this.importProducts(values[0].details);
        }
        if (values[1] && values[1].success) {
          this.conditions = values[1].details.data;
        }
      })
      .catch((e) => {});
  }

  createProduct(variants: any) {
    const vari = this.fb.group(variants) as FormGroup;
    vari
      .get('buy_price')
      ?.addValidators([Validators.required, Validators.min(0)]);
    vari
      .get('selling_price')
      ?.addValidators([Validators.required, Validators.min(0)]);
    vari.get('qty')?.addValidators([Validators.required, Validators.min(0)]);
    vari.addControl(
      'title',
      this.fb.control(
        [
          variants.var_1_title,
          variants.var_2_title,
          variants.var_3_title,
        ].reduce((prev, current) => {
          return prev + (prev !== '' && current ? ' / ' : '') + (current ?? '');
        }, '')
      )
    );
    vari.addControl(
      'formId',
      this.fb.control(this.pgService.randomInt(1, 1000))
    );
    //modify
    vari
      .get('start_at')
      ?.setValue(this.pgService.dateFormat(variants.start_at));
    vari
      .get('expired_at')
      ?.setValue(this.pgService.dateFormat(variants.expired_at));
    vari.addControl('variants', this.fb.array([]));
    vari.addControl('collapse', this.fb.control(true));

    this.traceChanges(vari, 'buy_price');
    this.traceChanges(vari, 'selling_price');
    this.traceChanges(vari, 'qty');
    this.traceChanges(vari, 'condition');

    this.defaultVariants.set(variants.id, {
      buy_price: variants['buy_price'],
      selling_price: variants['selling_price'],
      qty: variants['qty'],
      condition: variants['condition'].id,
    });
    return vari;
  }

  traceChanges(variant: AbstractControl, control: string) {
    const id = variant.get('id')?.value;

    variant
      .get(control)
      ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe((changes) => {
        // Attribute lvl changes detection
        const jsonChanges = JSON.stringify({
          buy_price: variant.get('buy_price')?.value,
          selling_price: variant.get('selling_price')?.value,
          qty: variant.get('qty')?.value,
          condition: variant.get('condition')?.value.id,
        });
        const jsonDefault = this.defaultVariants.get(id);

        if (jsonChanges != JSON.stringify(jsonDefault)) {
          variant.markAsDirty();
          this.variantsChanges.set(id, variant);
        } else {
          variant.markAsPristine();
          this.variantsChanges.delete(id);
        }

        // Attribute lvl changes detection
        if (
          (typeof changes == 'object' ? changes['id'] : changes) !=
          jsonDefault[control]
        ) {
          variant.get(control)?.markAsDirty();
        } else {
          variant.get(control)?.markAsPristine();
        }
      });
  }

  importProducts(resp: any) {
    (<FormArray>this.productFormGroup.get('products')).clear();

    resp.data.map((variants: any) => {
      (<FormArray>this.productFormGroup.get('products')).push(
        this.createProduct(variants)
      );
    });

    this.pagination = PaginationComponent.convertPaginationObject(resp);
  }

  /** Http */
  async getVariants(product: any) {
    let variants = <FormArray>product.get('variants');
    if (variants.controls.length !== 0) return;
    let params = new HttpParams();
    params = params.set('product_id', product.get('product')?.value?.id);
    params = params.set('filter_variants', product.get('id')?.value);
    const products = await lastValueFrom(this.getProducts(params))
      .then((result: any) => {
        return result.success ? result.details : null;
      })
      .catch(() => {
        return null;
      });
    if (!products) {
      return;
    }
    products.forEach((e: any) => {
      variants.push(this.createProduct(e));
    });
  }

  getProducts(filter?: HttpParams) {
    return this.http.GET(
      `brands/${this.auth.user.brand.id}/inventory/products`,
      filter ?? new HttpParams()
    );
  }

  deleteProduct(id: string) {
    return this.http.DELETE(`products/${id}`);
  }

  async pageChange(url: string | null) {
    if (url) {
      const productsResponse = await lastValueFrom(this.http.fetch(url))
        .then((result) => {
          return result.success ? result.details : null;
        })
        .catch(() => {
          return null;
        });
      if (!productsResponse) {
        return;
      }
      this.importProducts(productsResponse);
    }
  }

  /** Utility */
  compareCondition(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }

  /** Submit */
  submit() {
    const values = {
      variants: Array.from(this.variantsChanges.values()).map(
        (variant: AbstractControl) => {
          return {
            id: variant.get('id')?.value,
            buy_price: this.pgService.safeNum(variant.get('buy_price')?.value),
            selling_price: this.pgService.safeNum(
              variant.get('selling_price')?.value
            ),
            qty: variant.get('qty')?.value ?? 0,
            fk_condition_id: variant.get('condition')?.value?.id,
          };
        }
      ),
    };
    this.http
      .PUT(`brands/${this.auth.user.brand.id}/inventory/variants`, values)
      .subscribe({
        next: (result: any) => {
          if (result.success) {
            this.productFormGroup.markAsPristine();
            values.variants.forEach((v) => {
              this.defaultVariants.set(v.id, {
                buy_price: v['buy_price'],
                selling_price: v['selling_price'],
                qty: v['qty'],
                condition: v['fk_condition_id'],
              });
            });

            this.variantsChanges.clear();
          } else {
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    console.log(values);
  }

  async removeProduct(id: string) {
    const result: ConfirmBoxResult = await this.popup.confirmBox(
      'Do you want to delete?'
    );
    if (result == ConfirmBoxResult.CONFIRM) {
      lastValueFrom(this.deleteProduct(id)).then((response: any) => {
        if (response.success) {
          this.popup.showSuccessToast('Success');
        } else {
          this.popup.showTost(response.message);
        }
      });
    }
  }
}
