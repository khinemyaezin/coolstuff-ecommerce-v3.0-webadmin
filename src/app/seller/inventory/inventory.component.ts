import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl,
  FormBuilder,
  AbstractControl,
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
import { PaginationLink } from 'src/app/core-components/pagination/pagination.component';
import { ControllerService } from 'src/app/services/controller.service';
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

  // Watch changes to save
  private variantsChanges = new Map();

  productFormGroup: FormGroup = new FormGroup({
    products: new FormArray([]),
  });
  productCriFormGroup: FormGroup = new FormGroup({
    name: new FormControl(null),
    pageStyleGrid: new FormControl(true),
  });
  conditions: any = [];
  paginationLinks: PaginationLink[] = [];

  productMenuStatus = {
    pending: 1,
    active: 2,
    holding: 6,
    freeze: 4,
  };
  productItemStatus = {
    delete: 4,
  };
  tableHeader = [
    { className: 'name', title: 'Name', show: true },
    { className: 'image-col', title: 'Image', show: true },
    { className: 'sku-col', title: 'SKU', show: true },
    { className: 'price-col', title: 'Price', show: true },
    { className: 'price-col', title: 'Selling price', show: true },
    { className: 'price-col', title: 'Avaliable Qty', show: true },
    { className: 'prodgroup-col', title: 'Product Group', show: true },
    { className: 'condition', title: 'Condition', show: true },
    { className: 'date-range', title: 'Date range', show: true },
  ];

  productGroupModal: any;
  productGroupFormGroup: FormGroup = new FormGroup({
    id: new FormControl('-1'),
    name: new FormControl(''),
    products: new FormArray([]),
    pgList: new FormArray([]),
    isNew: new FormControl(true),
  });
  productSummaryData: any = {
    brandId: '',
    totalSellingPrice: 0.0,
    totalPrice: 0.0,
    profit: 0.0,
    totalProduct: 0,
  };
  private defaultVariants = new Map();

  constructor(
    public pgService: ControllerService,
    private http: ServerService,
    private fb: FormBuilder,
    private sellerService: SellerService,
    private popup: PopupService,
    private auth: AuthService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.init();
  }

  get productVariationControls(): AbstractControl[] {
    return (<FormArray>this.productFormGroup.get('products')).controls;
  }
  get pgItems() {
    return (<FormArray>this.productGroupFormGroup.controls['products'])
      .controls;
  }
  get pgStatus(): boolean {
    return this.productGroupFormGroup.controls['isNew'].value;
  }
  get saveBtnOn() {
    return this.variantsChanges.size > 0;
  }
  get chnagedVariNumber() {
    return this.variantsChanges.size;
  }

  getColumn(index: number) {
    return this.tableHeader[index];
  }
  getVariantControls(form: any): AbstractControl[] {
    return (<FormArray>form.get('variant')).controls;
  }
  async getVariants(product: any) {
    let variants = <FormArray>product.get('variants');
    if (variants.controls.length !== 0) return;
    let params = new HttpParams();
    params = params.set('product_id', product.get('product')?.value?.id);
    params = params.set('filter_variants', product.get('id')?.value);
    const products = await lastValueFrom(this.getProducts(params))
      .then((result: any) => {
        return result.status == 200 ? result.details : null;
      })
      .catch(() => {
        return null;
      });
    if (!products) {
      return;
    }
    products.forEach((e: any) => {
      variants.push(this.prepare(e));
    });
  }

  prepare(variants: any) {
    const vari = this.fb.group(variants) as FormGroup;

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
    vari.addControl('selected', this.fb.control(false));
    vari.addControl('edit', this.fb.control(true));
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

  convertChanges() {}

  async init() {
    const getProducts = this.getProducts();
    const getConditions = this.sellerService.getConditionList();

    lastValueFrom(forkJoin([getProducts, getConditions])).then(
      (values: any[]) => {
        if (values[0] && values[0].status == 200) {
          (<FormArray>this.productFormGroup.get('products')).clear();
          values[0].details.data.map((variants: any) => {
            (<FormArray>this.productFormGroup.get('products')).push(
              this.prepare(variants)
            );
          });
          this.paginationLinks = values[0].details.links;
        }
        if (values[1] && values[1].status == 200) {
          this.conditions = values[1].details.data;
        }
      }
    );
  }

  getProducts(filter?: HttpParams) {
    return this.http.GET(
      `brands/${this.auth.user.brand.id}/inventory/products`,
      undefined,
      filter ?? new HttpParams()
    );
  }

  async URL(url: string | null) {
    if (url) {
      const products = await lastValueFrom(this.http.fetch(url))
        .then((result) => {
          return result.status == 200 ? result.details : null;
        })
        .catch(() => {
          return null;
        });
      if (!products) {
        return;
      }

      (<FormArray>this.productFormGroup.get('products')).clear();

      products.data.map((variants: any) => {
        (<FormArray>this.productFormGroup.get('products')).push(
          this.prepare(variants)
        );
      });

      this.paginationLinks = products.links;
    }
  }

  compareCondition(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }

  inputNumberChange(vari: AbstractControl, formControlName: string) {
    let num = vari.get(formControlName)?.value;
    if (num < 0) {
      vari.get(formControlName)?.setValue(0, { emitEvent: false });
      num = 0;
    }
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

        console.log(jsonChanges);
        console.log(JSON.stringify(jsonDefault));

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

          try {
            // const cell = $(`[data-id="${id}"] .def-${control}-value`);
            // cell[0].innerText = jsonDefault[control];
           // $(cell).css('display', 'block');
          } catch {}
        } else {
          variant.get(control)?.markAsPristine();

          //$(`[data-id="${id}"] .def-${control}-value`).css('display', 'none');
        }
      });
  }

  submit() {
    const values = {
      variants: Array.from(this.variantsChanges.values()).map(
        (variant: AbstractControl) => {
          return {
            id: variant.get('id')?.value,
            buy_price: variant.get('buy_price')?.value,
            selling_price: variant.get('selling_price')?.value,
            qty: variant.get('qty')?.value,
            condition: variant.get('condition')?.value?.id,
          };
        }
      ),
    };
    this.http.PUT('prod-variants', values).subscribe({
      next: (result: any) => {
        if (result.status == 200) {
          this.popup.alert('Success!').then(() => {
            // Reset states
            this.productFormGroup.markAsPristine();
            //$(`.def-value`).css('display', 'none');

            values.variants.forEach((v) => {
              this.defaultVariants.set(v.id, {
                buy_price: v['buy_price'],
                selling_price: v['selling_price'],
                qty: v['qty'],
                condition: v['condition'],
              });
            });

            this.variantsChanges.clear();
          });
        } else {
        }
      },
      error: (err) => {},
    });
    console.log(values);
  }
}
