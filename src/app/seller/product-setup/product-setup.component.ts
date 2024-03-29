import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupService } from 'src/app/services/popup.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Utility } from 'src/app/services/utility.service';
import { ServerService } from 'src/app/services/server.service';
import { SellerService } from '../seller.service';
import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  lastValueFrom,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { BizStatus, Category, CategoryLeave } from 'src/app/services/core';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttributeSelectorComponent } from './attribute-selector/attribute-selector.component';
import {
  ProductSaveRequest,
  ProductSaveRequestVariant,
} from 'src/app/services/requests';
import {
  ProfitMarginCalculatorComponent,
  ProfitMarginResp,
} from 'src/app/core-components/profit-margin-calculator/profit-margin-calculator.component';
import { ComponentFather } from 'src/app/services/component-father';

@Component({
  selector: 'app-product-setup',
  templateUrl: './product-setup.component.html',
  styleUrls: ['./product-setup.component.scss'],
})
export class ProductSetupComponent extends ComponentFather implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nav') public tabs!: any;

  categoryForm: FormGroup = new FormGroup({
    search: new FormControl(''),
    searchResultList: new FormControl([]),
    data: new FormControl<CategoryLeave | null>(null),
  });
  productForm: FormGroup = new FormGroup({
    id: new FormControl(),
    status: new FormControl(2),
    title: new FormControl('', { validators: [Validators.required] }),
    brand: new FormControl('', { validators: [Validators.required] }),
    manufacturer: new FormControl('', { validators: [Validators.required] }),
    packType: new FormControl(null, { validators: [Validators.required] }),
    currency: new FormControl(null, { validators: [Validators.required] }),
    purchasedCurrency: new FormControl(null, {
      validators: [Validators.required],
    }),
    currencyRate: new FormControl(0),
    variants: new FormArray([]),
    hasVariant: new FormControl<boolean>(false),
  });
  filterControlForm: FormGroup = new FormGroup({
    selectAll: new FormControl(false),
    randomIdLength: new FormControl(10),
    randomIdOptions: new FormControl([10, 9, 8, 7, 6, 5, 4]),
    dateRange: new FormControl({ start: new Date(), end: new Date() }),
    price: new FormControl(0),
    sellingPrice: new FormControl(0, [Validators.required]),
    quantity: new FormControl(0),
    condition: new FormControl(''),
  });
  mediaFormControlNames = [
    { formControlName: 'media_1_image', title: 'Main media' },
    { formControlName: 'media_2_image', title: 'Right Side' },
    { formControlName: 'media_3_image', title: 'Left Side' },
    { formControlName: 'media_4_image', title: 'Up Side' },
    { formControlName: 'media_5_image', title: 'Bottom Side' },
    { formControlName: 'media_6_image', title: 'Front Side' },
    { formControlName: 'media_7_image', title: 'Back Side' },
    { formControlName: 'media_8_video', title: '' },
    { formControlName: 'media_9_video', title: '' },
  ];
  mediaConfig: MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1',
  };

  paramProductId: null | string = null;
  paramVariantId: null | string = null;

  standAloneVariant: any;
  packTypeList: any[] = [];
  deletedProducts = new Map();
  defImportProduct: any = null;
  conditionOptions: any[] = [];
  currencyByRegions: any[] = [];
  variantsMap!: Map<string, any>;

  options: any[] = [];
  attributes: FormArray = new FormArray<FormGroup>([]);
  isFilterFormCollapsed = true;
  checkedVariantCard = true;
  isCollapsedMedia = true;
  businessStatus = [
    { title: 'Active', value: 2 },
    { title: 'Draft', value: 6 },
  ];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public util: Utility,
    private authService: AuthService,
    private http: ServerService,
    public fb: FormBuilder,
    public sellerService: SellerService,
    public popup: PopupService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    private ref: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    super();
  }

  get getVariants(): FormArray {
    return this.productForm.controls['variants'] as FormArray;
  }

  get storeCurrency() {
    return this.productForm.get('currency')?.value;
  }

  get buyCurrency() {
    return this.productForm.get('purchasedCurrency')?.value;
  }

  get categoryBreadcrumb(): string {
    return this.categoryForm.get('data')?.value?.full_path;
  }

  get hasError() {
    return this.productForm.hasError('required');
  }
  ngAfterViewInit(): void {
    if (this.paramProductId && this.paramVariantId) {
      this.tabs.select(3);
    } else if (this.paramProductId) {
      this.tabs.select(2);
    } else {
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    const param: Observable<{ id: any; vid: any }> =
      this.activatedRoute.params.pipe(
        map((p: any) => {
          return {
            id: p?.id,
            vid: p?.vid,
          };
        })
      );
    param.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.paramProductId = value.id;
      this.paramVariantId = value.vid;
      this.standAloneVariant = this.createVariant();
      this.redirect(value.id, value.vid);
    });
    this.init();
  }

  redirect(id: string | null, vid: string | null) {
    if (id && vid) {
      this.initVariantById();
    } else if (id) {
      this.importProduct(id, null);
    } else {
      this.initNewProduct();
    }
  }

  async init() {
    this.browseCategory();
    this.createOptionGroup();
    this.onChangeVariantCheckBox();

    const getCondition = this.http.GET('conditions');
    const getPackTypes = this.http.GET('packtypes');
    const regions = this.sellerService.regions([
      { key: 'pagination', value: '-1' },
    ]);

    await new Promise<void>((res, rej) => {
      forkJoin([getCondition, getPackTypes, regions]).subscribe({
        next: (values: any[]) => {
          if (values[0] && values[0].success) {
            this.conditionOptions = values[0].details.data;
          }
          if (values[1] && values[1].success) {
            this.packTypeList = values[1].details.data;
          }
          if (values[2] && values[2].success) {
            this.currencyByRegions = values[2].details.data;
          }
          res();
        },
        error: () => {
          rej();
        },
      });
    });

    //Set default;
    this.productForm.controls['currency'].setValue(
      this.authService.user.brand.default_currency
    );
    this.productForm.controls['purchasedCurrency'].setValue(
      this.currencyByRegions.find(
        (r) => r.id == this.authService.user.brand.fk_region_id
      )
    );
    this.productForm.get('title')?.setValue('Untitled 1');
    this.productForm.get('brand')?.setValue(this.authService.user.brand.title);
    this.productForm
      .get('manufacturer')
      ?.setValue(this.authService.user.brand.title);
  }

  async initNewProduct() {
    this.getVariants.push(this.standAloneVariant);
    this.ref.detectChanges();

    // this.selectCategory({
    //   id: '56',
    //   lft: 63,
    //   rgt: 64,
    //   title: 'Accessories',
    //   full_path: 'Clohing, Shoes & Watches, Fashion, Boy, Accessories',
    //   lvl_id: '39',
    //   biz_status: 0,
    // });
    this.importLocations(this.standAloneVariant);
  }

  /** Import Locations */

  async importLocations(variantFormGroup: AbstractControl) {
    const locationResp = await lastValueFrom(
      this.getLocations(variantFormGroup.get('id')?.value)
    );
    if (locationResp && locationResp.success) {
      let locationsInVariant = <FormArray>variantFormGroup.get('locations');
      locationResp.details.forEach((loc: any) => {
        const location = this.createLocation();
        location.controls['id'].setValue(loc.id);
        location.controls['locationId'].setValue(loc.location.id);
        location.controls['locationTitle'].setValue(loc.location.title);
        location.controls['isDefault'].setValue(loc.location.default);
        location.controls['variantId'].setValue(loc.variant.id);
        location.controls['quantity'].setValue(loc.quantity ?? 0);

        location.controls['originQuantity'].setValue(loc.quantity ?? 0);
        location.controls['adjustBy'].setValue(0);
        locationsInVariant.push(location);
      });
    }
  }

  /** Vital Info */

  importVitalInfoForm(data: any) {
    this.productForm.get('id')?.setValue(data.id, { emitEvent: false });
    this.productForm
      .get('status')
      ?.setValue(data.biz_status, { emitEvent: false });
    this.productForm.get('title')?.setValue(data.title, { emitEvent: false });
    this.productForm.get('brand')?.setValue(data.brand, { emitEvent: false });
    this.productForm
      .get('manufacturer')
      ?.setValue(data.manufacture, { emitEvent: false });
    this.productForm
      .get('packType')
      ?.setValue(data.pack_type, { emitEvent: false });
    this.productForm
      .get('currency')
      ?.setValue(data.currency, { emitEvent: false });
    this.productForm
      .get('purchasedCurrency')
      ?.setValue(data.purchased_currency, { emitEvent: false });
      console.log(this.productForm.value);
      
  }

  /** Category */

  browseCategory() {
    this.categoryForm.controls['search'].valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((changes: any) => {
        if (this.util.isEmptyOrSpaces(changes)) {
          this.categoryForm.controls['searchResultList'].setValue([]);
        } else {
          // Request categories.
          lastValueFrom(this.getCategory(changes)).then((resp: any) => {
            if (resp.success) {
              this.categoryForm.get('searchResultList')?.setValue(
                resp.details.map((category: Category) => {
                  return category;
                })
              );
            }
          });
        }
      });
  }

  selectCategory(category: CategoryLeave) {
    this.importCategory(category);

    this.importAttributesToDefaultVariant(
      this.categoryForm.get('data')?.value.lvl_id,
      this.getVariants
    );
    this.tabs.select(2);
  }

  importCategory(category: CategoryLeave) {
    this.categoryForm.controls['search'].setValue('');
    this.categoryForm.controls['searchResultList'].setValue([]);
    this.categoryForm.controls['data'].setValue(category);
  }

  /** Description */

  addFeatures(i: number, e: any, variant: FormGroup) {
    if (this.util.isIgnoreKeys(e.keyCode)) {
      return;
    }
    let featuresLength = (<FormArray>variant.get('features')).length;
    if (i == featuresLength - 1) {
      (<FormArray>variant.get('features')).push(new FormControl(''));
    }
  }

  removeLastFeatures(variant: FormGroup) {
    let features: FormArray = <FormArray>variant.get('features');
    if (features.length - 2 > 0) features.removeAt(features.length - 2);
  }

  importDescription(data: any, variant: FormGroup) {
    if (!data.variant_option1_hdr) {
      if (data.variants[0].features) {
        let features = variant.controls['features'] as FormArray;
        features.clear();
        for (let feature of data.variants[0].features) {
          features.push(new FormControl(feature));
        }
        features.push(new FormControl(''));
      }
      if (data.variants[0].prod_desc) {
        variant.controls['description'].setValue(data.variants[0].prod_desc);
      }
    }
  }

  /** Attributes */

  private createAttribute(attribute: any, variantMapping = false) {
    return new FormGroup({
      id: new FormControl(attribute.id),
      title: new FormControl(),
      allowDetailCustomName: new FormControl<boolean>(
        attribute.allow_dtls_custom_name
      ),
      needDetailMapping: new FormControl<boolean>(attribute.need_dtls_mapping),
      optionHeader: new FormControl<any>(
        variantMapping
          ? attribute.varopt_hdr
          : {
              id: attribute.fk_varopt_hdr_id,
              title: attribute.title,
            }
      ),
      optionDetailArray: new FormControl([]),
      optionDetail: new FormControl(attribute?.varopt_dtl, {
        validators: [Validators.required, Validators.minLength(1)],
      }),
      optionUnitArray: new FormControl(attribute?.option_units),
      optionUnit: new FormControl<null | any>(attribute?.varopt_unit),
      optionUnitLoad: new FormControl<boolean>(false),
      value: new FormControl(attribute?.value),
    });
  }

  importAttributesToDefaultVariant(lvlCategoryId: string, variants: FormArray) {
    let httpParm = new HttpParams();
    httpParm = httpParm.append('relationships', 'optionUnits');
    lastValueFrom(
      this.http.GET(`categories/${lvlCategoryId}/attributes`, httpParm)
    ).then((resp: any) => {
      if (resp.success) {
        variants.controls.forEach((variant) => {
          (variant.get('attributes') as FormArray).clear();
          resp.details.data.forEach((attribute: any) => {
            Object.assign(attribute, {
              fk_varopt_hdr_id: attribute.id,
            });
            (variant.get('attributes') as FormArray).push(
              this.createAttribute(attribute)
            );
          });
        });
      }
    });
  }

  openAttributeEditor(attribute: AbstractControl) {
    const model = this.modalService.open(AttributeSelectorComponent, {
      centered: true,
    });
    model.componentInstance.activeModal = model;
    model.componentInstance.attribute = attribute;
  }

  /** Variants */

  private createVariantOptionItem(
    optionOrder: number,
    name: string = '',
    id: number = this.util.randomInt(1, 1000)
  ) {
    let formGroup = this.fb.group({
      id: new FormControl(id),
      name: new FormControl(name),
      error: new FormControl({ isError: false, message: '' }),
      optionOrder: new FormControl(optionOrder),
    });
    this.changeVariantOption(optionOrder, formGroup);
    return formGroup;
  }

  private createLocation() {
    return this.fb.group({
      id: new FormControl(),
      locationId: new FormControl(),
      locationTitle: new FormControl(),
      isDefault: new FormControl(false),
      variantId: new FormControl(),
      quantity: new FormControl(0),

      originQuantity: new FormControl(),
      adjustBy: new FormControl(),
    });
  }

  private createVariant(
    optionHdr1: any = null,
    title1: any = null,
    optionHdr2: any = null,
    title2: any = null,
    optionHdr3: any = null,
    title3: any = null
  ): FormGroup {
    let option = (header: any, input: any) => {
      return this.fb.group({
        header: new FormControl(header),
        detail: new FormControl('', { validators: Validators.required }),
        unit: new FormControl(null),
        inputRef: input,
      });
    };
    return this.fb.group({
      formId: new FormControl(this.util.randomInt(1, 1000)),
      selected: new FormControl(false),
      edit: new FormControl(false),
      id: new FormControl('-1'),
      status: new FormControl(2),
      sellerSku: new FormControl(this.util.randomString(10)),
      barcode: new FormControl(''),
      variantOptions: new FormControl([
        option(optionHdr1, title1),
        option(optionHdr2, title2),
        option(optionHdr3, title3),
      ]),
      price: new FormControl(0),
      purchasedPrice: new FormControl(0),
      sellingPrice: new FormControl(0),
      comparedPrice: new FormControl(0),
      quantity: new FormControl(0),
      trackQuantity: new FormControl<boolean>(true),
      keepSellingOutofstock: new FormControl<boolean>(false),
      dateRange: new FormControl({ start: new Date(), end: new Date() }),
      condition: new FormControl(''),
      images: new FormArray([]),
      description: new FormControl(''),
      features: new FormArray([new FormControl('')]),
      media_1_image: new FormControl(null),
      media_2_image: new FormControl(null),
      media_3_image: new FormControl(null),
      media_4_image: new FormControl(null),
      media_5_image: new FormControl(null),
      media_6_image: new FormControl(null),
      media_7_image: new FormControl(null),
      media_8_video: new FormControl(null),
      media_9_video: new FormControl(null),
      attributes: new FormArray([]),
      locations: new FormArray([]),
    });
  }

  onChangeVariantCheckBox() {
    this.productForm.controls['hasVariant'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((change: boolean) => {
        this.getVariants.clear();

        if (!change) {
          //unchecked variant
          if (!this.util.isEmptyID(this.standAloneVariant.get('id').value)) {
            this.standAloneVariant.get('status')?.setValue(2);
            this.deletedProducts.delete(this.standAloneVariant.get('id').value);
          }
          this.getVariants.push(this.standAloneVariant);
        } else {
          if (!this.util.isEmptyID(this.standAloneVariant.get('id').value)) {
            this.standAloneVariant.get('status')?.setValue(4);
            this.deletedProducts.set(
              this.standAloneVariant.get('id').value,
              this.standAloneVariant
            );
          }
        }
      });
  }

  removeVariantOptionHeader(optionGroupIndex: number) {
    if (!this.options[optionGroupIndex].get('header')?.value) return;

    let optionsItems = <FormArray>this.options[optionGroupIndex].get('list');

    /**
     * Check header remove case when option header exist and items empty
     * just clear header value and return
     */
    if (
      this.util.isEmptyOrSpaces(optionsItems.controls[0].get('name')?.value)
    ) {
      this.options[optionGroupIndex].get('header')?.setValue('');
      return;
    }

    const optionIdIndexZero = optionsItems.controls[0].get('id')?.value;

    const indexArray = [...Array(this.options.length).keys()];
    indexArray.splice(optionGroupIndex, 1);
    const desiredIndex = [...indexArray, optionGroupIndex];

    for (let i = this.getVariants.controls.length - 1; i >= 0; i--) {
      const optionIdInVariants = this.getVariants.controls[i]
        .get('variantOptions')
        ?.value[optionGroupIndex].get('inputRef.id')?.value;

      const variantId = this.getVariants.controls[i].get('id')?.value;

      if (optionIdInVariants !== optionIdIndexZero) {
        /**
         * Add to deleted var
         */
        if (!this.util.isEmptyID(variantId)) {
          this.deletedProducts.set(variantId, this.getVariants.controls[i]);
        }
        this.getVariants.removeAt(i);
      } else {
        /**
         * Reorder options array of a product
         */
        const removeLast = (optionGroup: FormGroup, index: number) => {
          if (this.options.length - 1 == index) {
            optionGroup.get('header')?.setValue(null);
            optionGroup.get('detail')?.setValue(null);
            optionGroup.get('inputRef.name')?.setValue('');
          }
        };
        this.reorder(
          this.getVariants.controls[i].get('variantOptions')?.value,
          desiredIndex,
          this.getVariants.controls[i].get('variantOptions')?.value.length,
          removeLast
        );
      }
    }

    /** Swap options array */
    const updateOptionItemsOrder = (item: FormGroup, index: number) => {
      (<FormArray>item.get('list')).controls.forEach((optionItem) => {
        optionItem.get('optionOrder')?.setValue(index);
      });
    };
    this.reorder(
      this.options,
      desiredIndex,
      this.options.length,
      updateOptionItemsOrder
    );
    this.options[this.options.length - 1]
      .get('header')
      .setValue(null, { emitEvent: false });
    (<FormArray>this.options[this.options.length - 1].get('list')).clear();

    /**
     * Check current deleted header is the last header
     */
    const isLastOption = this.options.reduce(
      (previous: number, current: FormGroup) => {
        return previous + (current.get('header')?.value ? 1 : 0);
      },
      0
    );

    if (isLastOption == 0) {
      this.getVariants.controls.forEach((e) => {
        if (!this.util.isEmptyID(e.get('id')?.value)) {
          this.deletedProducts.set(e.get('id')?.value, e);
        }
      });

      this.productForm.get('hasVariant')?.setValue(false);
    }
    this.checkedVariantCard = isLastOption == 0;
  }

  reorder(
    original: any[],
    orderedIndex: any[],
    length: number,
    callback?: Function
  ) {
    let temp = [...Array(length)];
    for (let i = 0; i < length; i++) {
      temp[i] = original[orderedIndex[i]];
    }
    for (let i = 0; i < this.options.length; i++) {
      original[i] = temp[i];
      if (callback) callback(original[i], i);
    }
    return temp;
  }

  onSelectVariantOptionHeader(
    optionGroup: FormGroup,
    optionOrderIndex: number
  ) {
    if (
      optionOrderIndex !== 0 &&
      !this.options[optionOrderIndex - 1].get('header')?.value
    ) {
      console.log('need to swap');
      //this.removeVariantOptionHeader(optionOrderIndex - 1)
      // const indexArray = [...Array(this.options.length).keys()];
      // indexArray.splice(optionOrderIndex - 1, 1);
      // const desiredIndex = [...indexArray, optionOrderIndex - 1];
      // console.log(desiredIndex);
      // this.reorder(this.options, desiredIndex, this.options.length);

      // this.getVariants.controls.forEach((v) => {
      //   this.reorder(
      //     v.get('variantOptions')?.value,
      //     desiredIndex,
      //     v.get('variantOptions')?.value.length
      //   );
      // });
    }

    //Reset
    const optionItems = optionGroup.controls['list'] as FormArray;
    optionItems.clear();
    optionItems.push(this.createVariantOptionItem(optionOrderIndex));

    // Cant get selected header id here.. see createOptionGroup->  <<Get option units>>

    this.checkedVariantCard = false;
  }

  onChangeOptionItem(
    optionIndex: number,
    optionInputIndex: number,
    option: any,
    e: any
  ) {
    if (this.util.isIgnoreKeys(e.keyCode)) {
      return;
    }
    let optionItems = <FormArray>this.options[optionIndex].get('list');

    /** Add extra input box for next */
    if (optionInputIndex == optionItems.controls.length - 1) {
      if (option.get('name')?.value !== '') {
        optionItems.push(this.createVariantOptionItem(optionIndex));
      }
    }
  }

  private createOptionGroup() {
    this.options = [];
    for (let i = 0; i < 3; i++) {
      const option = new FormGroup({
        header: new FormControl(null, { validators: Validators.required }),
        list: new FormArray([]),
        units: new FormArray([]),
      });

      // <<Get option units>>
      option
        .get('header')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe((changes: any) => {
          if (
            changes &&
            typeof changes === 'object' &&
            (<FormArray>option.get('units')).controls.length == 0
          ) {
            lastValueFrom(this.getOptionUnits(changes?.id)).then((resp) => {
              resp.details.data.forEach((unit: any) => {
                (<FormArray>option.get('units')).push(
                  new FormGroup({
                    id: new FormControl(unit.id),
                    title: new FormControl(unit.title),
                  })
                );
              });
            });
          }
        });

      this.options.push(option);
    }
    //sample
  }

  removeVariantOption(optionIndex: number, optionInputIndex: number) {
    let productFormArray = this.getVariants;
    const optionId = this.options[optionIndex].get(
      'list.' + optionInputIndex + '.id'
    )?.value;

    /**
     * Loop backward and remove from last top first
     */
    for (let i = productFormArray.controls.length - 1; i >= 0; i--) {
      const id = productFormArray.controls[i]
        .get('variantOptions')
        ?.value[optionIndex].get('inputRef.id')?.value;
      const prodId = productFormArray.controls[i].get('id')?.value;
      if (id && optionId == id) {
        if (this.util.isEmptyID(prodId)) {
          productFormArray.removeAt(i);
        } else {
          productFormArray.controls[i].get('status')?.setValue(4);
        }
      }
    }

    (<FormArray>this.options[optionIndex].get('list')).removeAt(
      optionInputIndex
    );

    if (productFormArray.controls.length == 0) {
      this.productForm.get('hasVariant')?.setValue(false);
    }
  }

  selectVariants(operation: boolean) {
    let controls = this.getVariants.controls.filter((c) => {
      return c.get('status')?.value !== 4;
    });
    for (let c of controls as FormGroup[]) {
      c.controls['selected'].setValue(operation);
    }
  }

  replaceAllPrice(formControlName: string) {
    const value = this.filterControlForm.controls[formControlName].value;

    for (let c of this.getVariants.controls) {
      if (c.get('selected')?.value) c.get(formControlName)?.setValue(value);
    }
  }

  replaceAllDateRange() {
    const startDate = this.filterControlForm.get('startDate')?.value;
    const endDate = this.filterControlForm.get('endDate')?.value;
    for (let c of this.getVariants.controls) {
      if (c.value.selected) {
        c.get('startDate')?.setValue(startDate);
        c.get('endDate')?.setValue(endDate);
      }
    }
  }

  replaceAllCondition() {
    for (let c of this.getVariants.controls) {
      if (c.value.selected) {
        c.get('condition')?.setValue(
          this.filterControlForm.controls['condition'].value
        );
      }
    }
  }

  generateRandomSKUS() {
    for (let c of this.getVariants.controls) {
      if (c.value.selected)
        c.get('sellerSku')?.setValue(
          this.util.randomString(this.filterControlForm.value.randomIdLength)
        );
    }
  }

  removeVariant(variant: AbstractControl, index: number) {
    let variants = this.getVariants;
    let opt1 = <FormArray>this.options[0].controls['list'];
    let opt2 = <FormArray>this.options[1].controls['list'];
    let opt3 = <FormArray>this.options[2].controls['list'];
    let opt1Count = 0;
    let opt2Count = 0;
    let opt3Count = 0;
    const opt1Name = variant
      .get('variantOptions')
      ?.value[0].get('inputRef.name')?.value;
    const opt2Name = variant
      .get('variantOptions')
      ?.value[1].get('inputRef.name')?.value;
    const opt3Name = variant
      .get('variantOptions')
      ?.value[2].get('inputRef.name')?.value;

    if (
      variants.controls.filter((e) => {
        return e.get('status')?.value !== 4;
      }).length == 1
    ) {
      /** Last variant to convert stand alone
       *  and return void
       */
      this.getVariants.controls.forEach((e) => {
        const id = e.get('id')?.value;
        if (
          !this.util.isEmptyID(id) &&
          this.standAloneVariant.get('id')?.value != id
        ) {
          this.deletedProducts.set(e.get('id')?.value, e);
        }
      });
      (this.options[0] as FormGroup).reset();

      this.productForm.get('hasVariant')?.setValue(false);
      this.checkedVariantCard = !this.hasOptionHeaders();
      return;
    }

    /**
     * Not last one and continue remove process
     */

    if (!this.util.isEmptyID(variant.get('id')?.value)) {
      variant.get('status')?.setValue(4);
    } else {
      variants.removeAt(index);
    }

    for (let i = 0; i < variants.controls.length; i++) {
      const prodOpt1Name = variants.controls[i]
        .get('variantOptions')
        ?.value[0].get('inputRef.name')?.value;
      const prodOpt2Name = variants.controls[i]
        .get('variantOptions')
        ?.value[1].get('inputRef.name')?.value;
      const prodOpt3Name = variants.controls[i]
        .get('variantOptions')
        ?.value[2].get('inputRef.name')?.value;
      const status = variants.controls[i].get('status')?.value;
      if (opt1Name && status !== 4 && opt1Name == prodOpt1Name) {
        opt1Count++;
      }
      if (opt2Name && status !== 4 && opt2Name == prodOpt2Name) {
        opt2Count++;
      }
      if (opt3Name && status !== 4 && opt3Name == prodOpt3Name) {
        opt3Count++;
      }
    }
    if (opt1Count == 0 && opt1Name) {
      const index = opt1.controls.findIndex((e) => {
        return e.get('name')?.value == opt1Name;
      });
      if (index !== -1) opt1.removeAt(index);
    }
    if (opt2Count == 0 && opt2Name) {
      const index = opt2.controls.findIndex((e) => {
        return e.get('name')?.value == opt2Name;
      });
      if (index !== -1) opt2.removeAt(index);
    }
    if (opt3Count == 0 && opt3Name) {
      const index = opt3.controls.findIndex((e) => {
        return e.get('name')?.value == opt3Name;
      });
      if (index !== -1) opt3.removeAt(index);
    }
  }

  restoreVariant(variant: any) {
    const opt1Name = variant
      .get('variantOptions')
      ?.value[0].get('inputRef.name')?.value;
    const opt2Name = variant
      .get('variantOptions')
      ?.value[1].get('inputRef.name')?.value;
    const opt3Name = variant
      .get('variantOptions')
      ?.value[2].get('inputRef.name')?.value;
    let opt1 = this.options[0].get('list');
    let opt2 = this.options[1].get('list');
    let opt3 = this.options[2].get('list');
    variant.controls['status'].setValue(2);
    if (opt1Name) {
      const index = opt1.controls.findIndex((e: any) => {
        return e.get('name')?.value == opt1Name;
      });
      if (index == -1) {
        let prodFormGroup = <FormGroup>variant.get('variantOptions')?.value[0];
        opt1.controls.unshift(prodFormGroup.controls['inputRef']);
      }
    }
    if (opt2Name) {
      const index = opt2.controls.findIndex((e: any) => {
        return e.get('name')?.value == opt2Name;
      });
      if (index == -1) {
        let prodFormGroup = <FormGroup>variant.get('variantOptions')?.value[1];
        opt2.controls.unshift(prodFormGroup.controls['inputRef']);
      }
    }
    if (opt3Name) {
      const index = opt3.controls.findIndex((e: any) => {
        return e.get('name')?.value == opt3Name;
      });
      if (index == -1) {
        let prodFormGroup = <FormGroup>variant.get('variantOptions')?.value[2];
        opt3.controls.unshift(prodFormGroup.controls['inputRef']);
      }
    }
  }

  changeVariantOption(optionIndex: number, optionItem: FormGroup) {
    optionItem.controls['name'].valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe((changes: any) => {
        if (!this.util.isEmptyOrSpaces(changes)) {
          optionIndex = optionItem.get('optionOrder')?.value;
          let duplicate = 0;
          let optionCount = 0;

          for (let prod of this.getVariants.controls) {
            const title = (prod.get('variantOptions')?.value as FormGroup[])[
              optionIndex
            ].get('inputRef.name')?.value;

            const id = (prod.get('variantOptions')?.value as FormGroup[])[
              optionIndex
            ].get('inputRef.id')?.value;
            if (
              title &&
              id !== optionItem.get('id')?.value &&
              title === changes
            ) {
              duplicate++;
            }
            if (optionItem.get('id')?.value == id) optionCount++;
          }
          /** Create Duplicate alert in removed products */
          if (duplicate > 0) {
            this.alertVariantOptionError(optionItem, changes);
            optionItem.controls['name'].setValue(changes.slice(0, -1), {
              emitEvent: false,
            });
            //return;
          }
          if (optionCount > 0) return;

          /** Add line to products array */
          if (optionIndex == 0) {
            let firstOptionItems = [optionItem];
            let secondOptionItems = this.options[1]
              .get('list')
              .controls.filter((v: any) => {
                return !this.util.isEmptyOrSpaces(v.get('name')?.value);
              });
            let thirdOptionItems = this.options[2]
              .get('list')
              .controls.filter((v: any) => {
                return !this.util.isEmptyOrSpaces(v.get('name')?.value);
              });
            this.applyVariantOption(
              firstOptionItems,
              secondOptionItems,
              thirdOptionItems
            );
          } else if (optionIndex == 1) {
            // <<Add line to products array>>
            // <<Check Option index if 0 just add it to product>>
            if (this.options[1].get('list').controls.indexOf(optionItem) == 0) {
              //this.option2 = this.variationForm.controls["secondTheme"].value;
              this.applyVariantOptionIndex0(optionItem, optionIndex);
            } else {
              let firstOptionItems = this.options[0]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.util.isEmptyOrSpaces(v.get('name')?.value);
                });
              let secondOptionItems = [optionItem];
              let thirdOptionItems = this.options[2]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.util.isEmptyOrSpaces(v.get('name')?.value);
                });
              this.applyVariantOption(
                firstOptionItems,
                secondOptionItems,
                thirdOptionItems
              );
            }
          } else {
            /** Add line to products array */
            /** Check Option index if 0 just add it to product */
            if (this.options[2].get('list').controls.indexOf(optionItem) == 0) {
              //this.option2 = this.variationForm.controls["secondTheme"].value;
              this.applyVariantOptionIndex0(optionItem, optionIndex);
            } else {
              let firstOptionItems = this.options[0]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.util.isEmptyOrSpaces(v.get('name')?.value);
                });
              let secondOptionItems = this.options[1]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.util.isEmptyOrSpaces(v.get('name')?.value);
                });
              let thirdOptionItems = [optionItem];
              this.applyVariantOption(
                firstOptionItems,
                secondOptionItems,
                thirdOptionItems
              );
            }
          }
        }
      });
  }

  alertVariantOptionError(
    variantOptionItem: AbstractControl<FormControl>,
    title: string
  ) {
    let error: any = variantOptionItem.get('error')?.value;
    error.isError = true;
    error.message = "You've already use the option value " + title;

    setTimeout(() => {
      error.isError = false;
      error.message = '';
    }, 1500);
  }

  applyVariantOption(
    firstOptionItems: AbstractControl[],
    secondOptionItems: AbstractControl[],
    thirdOptionItems: AbstractControl[]
  ) {
    let productFormArray = this.getVariants;

    for (let a = 0; a < firstOptionItems.length; a++) {
      if (secondOptionItems.length != 0) {
        for (let b = 0; b < secondOptionItems.length; b++) {
          if (thirdOptionItems.length != 0) {
            for (let c = 0; c < thirdOptionItems.length; c++) {
              const pfIndex = -1;
              if (pfIndex !== -1) {
                (productFormArray.controls[pfIndex] as FormGroup).controls[
                  'status'
                ].setValue(2);
              } else {
                let variant = this.createVariant(
                  this.options[0].get('header').value,
                  firstOptionItems[a],
                  this.options[1].get('header').value,
                  secondOptionItems[b],
                  this.options[2].get('header').value,
                  thirdOptionItems[c]
                );
                productFormArray.push(variant);
              }
            }
          } else {
            const pfIndex = -1;
            if (pfIndex !== -1) {
              (productFormArray.controls[pfIndex] as FormGroup).controls[
                'status'
              ].setValue(2);
            } else {
              let variant = this.createVariant(
                this.options[0].get('header').value,
                firstOptionItems[a],
                this.options[1].get('header').value,
                secondOptionItems[b]
              );
              productFormArray.push(variant);
            }
          }
        }
      } else {
        const pfIndex = -1;
        if (pfIndex !== -1) {
          (productFormArray.controls[pfIndex] as FormGroup).controls[
            'status'
          ].setValue(2);
        } else {
          let variant = this.createVariant(
            this.options[0].get('header').value,
            firstOptionItems[a]
          );
          productFormArray.push(variant);
        }
      }
    }
  }

  applyVariantOptionIndex0(
    optionItemRef: AbstractControl,
    optionIndex: number
  ) {
    let productFormArray = this.getVariants;
    for (let control of productFormArray.controls as FormGroup[]) {
      let prodFormGroup = control.get('variantOptions')?.value[optionIndex];

      prodFormGroup.controls['inputRef'] = optionItemRef;
      prodFormGroup.controls['header'].setValue(
        this.options[optionIndex].controls['header'].value
      );
    }
  }

  hasOptionHeaders() {
    return (
      this.options.reduce((prev: any, curr: any) => {
        return prev + curr.get('header')?.value ? 1 : 0;
      }, 0) !== 0
    );
  }

  /** Http */

  getCategory(searchNames: string) {
    let param = new HttpParams();
    param = param.set('title', searchNames);
    return this.http.GET('category-leaves', param);
  }

  readonly getVariantOptionItems = (search: string, headerId: string) => {
    let param = new HttpParams();
    param = param.append('title', search);
    return this.http.GET(`options/headers/${headerId}/details`);
  };

  getAttributes(
    optionName: string,
    categoryId: string,
    relationships: string = ''
  ) {
    let httparam = new HttpParams();
    httparam = httparam.append('title', optionName);
    httparam = httparam.append('relationships', relationships);
    return this.http.GET(`categories/${categoryId}/attributes`, httparam);
  }

  getProductById(id: string, variantId: string | null) {
    let httpParam = new HttpParams();
    httpParam = httpParam.set(
      'relationships',
      'variants,myBrand,category,lvlCategory,packType,currency,purchasedCurrency,variantOption1Hdr,variantOption2Hdr,variantOption3Hdr'
    );
    httpParam = httpParam.set(
      'variants',
      'media_1_image,media_2_image,media_3_image,media_4_image,media_5_image,media_6_image,media_7_image,media_8_video,media_9_video,variantOption1Dtl,variantOption1Unit,variantOption2Dtl,variantOption2Unit,variantOption3Dtl,variantOption3Unit'
    );
    return this.http.GET(`products/${id}`, httpParam);
  }

  saveProduct(product: any) {
    return this.http.POST('products', product);
  }

  updateProduct(product: any, id: string) {
    return this.http.PUT(`products/${id}`, product);
  }

  updateVariant(variant: any, productId: string, variantId: string) {
    return this.http.PUT(`products/${productId}/${variantId}`, variant);
  }

  getVariantById(productId: string, variantId: string) {
    let param = new HttpParams();
    param = param.append(
      'relationships',
      'product,condition,media_1_image,media_2_image,media_3_image,media_4_image,media_5_image,media_6_image,media_7_image,media_8_video,media_9_video,variantOption1Dtl,variantOption2Dtl,variantOption3Dtl'
    );
    param = param.append('brothers', true);
    param = param.append(
      'product',
      'myBrand,category,packType,currency,purchasedCurrency,variantOption1Hdr,variantOption2Hdr,variantOption3Hdr'
    );
    return this.http.GET(`products/${productId}/${variantId}`, param);
  }

  getLocations(variantId: string | null = null) {
    let httpParam = new HttpParams();
    if (variantId) {
      httpParam = httpParam.append('prod_variant_id', variantId);
    }
    return this.http.GET('locations/by-product', httpParam);
  }

  getOptionUnits(headerId: string, param?: { key: string; value: any }[]) {
    let httpParam = new HttpParams();
    param?.forEach((filter) => {
      httpParam = httpParam.append(filter.key, filter.value);
    });
    return this.http.GET(`options/headers/${headerId}/units`, httpParam);
  }

  // << Import Export >>

  async importProduct(productId: any, variantId: any) {
    let loading = await this.popup.showLoading('please wait').then((e: any) => {
      return e;
    });
    loading.present();
    const product = await lastValueFrom(
      this.getProductById(productId, variantId)
    )
      .then((result: any) => {
        return result.success ? result.details : null;
      })
      .catch(() => {
        return null;
      });
    if (!product) {
      loading.dismiss();
      return;
    }
    this.defImportProduct = product;
    this.importVitalInfoForm(product);

    let categoryLeave: CategoryLeave = {
      id: null,
      biz_status: 0,
      title: '',
      full_path: '',
      lft: 0,
      rgt: 0,
      lvl_id: null,
    };
    Object.assign(categoryLeave, product.category);
    categoryLeave.lvl_id = product.fk_lvlcategory_id;
    this.importCategory(categoryLeave);

    this.importVariants(product);

    loading.dismiss();
  }

  importVariants(data: any) {
    this.productForm.controls['hasVariant'].patchValue(data.has_variant, {
      emitEvent: false,
    });

    if (data.has_variant) {
      for (let i = 0; i < this.options.length; i++) {
        let optionHeader = data['variant_option' + (i + 1) + '_hdr'];
        if (optionHeader) {
          let optionItems = this.options[i].get('list') as FormArray;
          this.options[i].get('header').setValue(optionHeader); //Set global option 1.
          this.options[i].get('header').markAsDirty();
          optionItems.clear(); //Clear the array
          optionHeader.details.forEach((detail: any) => {
            optionItems.push(this.createVariantOptionItem(i, detail.var_title));
          });
          optionItems.push(this.createVariantOptionItem(i));
        }
      }
    }

    this.getVariants.clear();

    for (let variant of data.variants) {
      let variantFormGroup: FormGroup = this.createVariant();
      variantFormGroup.controls['id'].setValue(variant.id);
      variantFormGroup.controls['variantOptions'].value.forEach(
        (option: FormGroup, i: number) => {
          option.get('detail')?.setValue(variant[`variant_option${i + 1}_dtl`]);
          if (variant[`variant_option${i + 1}_dtl`]) {
            option.get('detail')?.markAsDirty();
          }
          option.get('unit')?.setValue(variant[`variant_option${i + 1}_unit`]);
          option.get('header')?.setValue(this.options[i].get('header')?.value);
        }
      );
      variantFormGroup.controls['condition'].setValue({
        id: variant.fk_condition_id,
      });
      variantFormGroup.controls['price'].setValue(variant.buy_price);
      variantFormGroup.controls['purchasedPrice'].setValue(variant.purchased_price);
      variantFormGroup.controls['comparedPrice'].setValue(
        variant.compared_price
      );

      variantFormGroup.controls['sellingPrice'].setValue(variant.selling_price);
      variantFormGroup.controls['trackQuantity'].setValue(variant.track_qty);
      variantFormGroup.controls['quantity'].setValue(variant.qty);
      variantFormGroup.controls['sellerSku'].setValue(variant.seller_sku);
      variantFormGroup.controls['dateRange'].setValue({
        start: this.util.dateFormat(variant.start_at),
        end: this.util.dateFormat(variant.expired_at),
      });
      if (variant.features) {
        const features = variantFormGroup.controls['features'] as FormArray;
        features.clear();
        variant.features.forEach((f: string) => {
          features.push(new FormControl(f));
        });
        features.push(new FormControl(''));
      }
      if (variant.attributes) {
        variant.attributes.forEach((attribute: any) => {
          let attriFormGroup = this.createAttribute(attribute, true);
          attriFormGroup.get('optionDetail')?.markAsDirty();
          (variantFormGroup.controls['attributes'] as FormArray).push(
            attriFormGroup
          );
        });
      }
      variantFormGroup.controls['description'].setValue(variant.prod_desc);

      variantFormGroup.controls['media_1_image'].setValue(
        variant.media_1_image
      );
      variantFormGroup.controls['media_2_image'].setValue(
        variant.media_2_image
      );
      variantFormGroup.controls['media_3_image'].setValue(
        variant.media_3_image
      );
      variantFormGroup.controls['media_4_image'].setValue(
        variant.media_4_image
      );
      variantFormGroup.controls['media_5_image'].setValue(
        variant.media_5_image
      );
      variantFormGroup.controls['media_6_image'].setValue(
        variant.media_6_image
      );
      variantFormGroup.controls['media_7_image'].setValue(
        variant.media_7_image
      );
      variantFormGroup.controls['media_8_video'].setValue(
        variant.media_8_video
      );
      variantFormGroup.controls['media_9_video'].setValue(
        variant.media_9_video
      );

      for (let i = 0; i < this.options.length; i++) {
        const index = this.options[i]
          .get('list')
          .controls.findIndex((optionItem: any) => {
            return (
              optionItem.controls['name'].value ==
              variant['var_' + (i + 1) + '_title']
            );
          });
        if (index != -1) {
          (<FormGroup>(
            variantFormGroup.get('variantOptions')?.value[i]
          )).controls['inputRef'] = this.options[i].get('list').controls[index];
        }
      }

      this.getVariants.push(variantFormGroup);
      this.ref.detectChanges();
    }
    // << Sorting >>
    this.getVariants.controls.sort((a: any, b: any) => {
      return (
        a
          .get('variantOptions')
          .value[0].get('detail')
          ?.value?.id.localeCompare(
            b.get('variantOptions').value[0].get('detail')?.value?.id
          ) ||
        a.get('variantOptions').value[1].get('detail')?.value?.id -
          b.get('variantOptions').value[1].get('detail')?.value?.id
      );
    });

    if (data.has_variant) {
      this.importAttributesToDefaultVariant(
        this.categoryForm.get('data')?.value.lvl_id,
        this.getVariants
      );
      this.checkedVariantCard = false;
    }
    // << Set def variant >>
    this.standAloneVariant = this.getVariants.controls[0];
    this.importLocations(this.standAloneVariant);
  }

  importVariant(variant: any) {
    let variantFormGroup: FormGroup = this.createVariant();
    variantFormGroup.controls['id'].setValue(variant.id);
    variantFormGroup.controls['condition'].setValue(variant.condition);
    variantFormGroup.controls['price'].setValue(variant.buy_price);
    variantFormGroup.controls['purchasedPrice'].setValue(variant.purchased_price);
    variantFormGroup.controls['sellingPrice'].setValue(variant.selling_price);
    variantFormGroup.controls['comparedPrice'].setValue(variant.compared_price);
    variantFormGroup.controls['trackQuantity'].setValue(variant.track_qty);
    variantFormGroup.controls['quantity'].setValue(variant.qty);
    variantFormGroup.controls['sellerSku'].setValue(variant.seller_sku);
    variantFormGroup.controls['dateRange'].setValue({
      start: this.util.dateFormat(variant.start_at),
      end: this.util.dateFormat(variant.expired_at),
    });
    if (variant.features) {
      const features = variantFormGroup.controls['features'] as FormArray;
      features.clear();
      variant.features.forEach((f: string) => {
        features.push(new FormControl(f));
      });
      features.push(new FormControl(''));
    }
    if (variant.attributes) {
      variant.attributes.forEach((attribute: any) => {
        let attriFormGroup = this.createAttribute(attribute, true);
        attriFormGroup.get('optionDetail')?.markAsDirty();
        (variantFormGroup.controls['attributes'] as FormArray).push(
          attriFormGroup
        );
      });
    }
    variantFormGroup.controls['description'].setValue(variant.prod_desc);

    variantFormGroup.controls['media_1_image'].setValue(variant.media_1_image);
    variantFormGroup.controls['media_2_image'].setValue(variant.media_2_image);
    variantFormGroup.controls['media_3_image'].setValue(variant.media_3_image);
    variantFormGroup.controls['media_4_image'].setValue(variant.media_4_image);
    variantFormGroup.controls['media_5_image'].setValue(variant.media_5_image);
    variantFormGroup.controls['media_6_image'].setValue(variant.media_6_image);
    variantFormGroup.controls['media_7_image'].setValue(variant.media_7_image);
    variantFormGroup.controls['media_8_video'].setValue(variant.media_8_video);
    variantFormGroup.controls['media_9_video'].setValue(variant.media_9_video);
    this.importLocations(variantFormGroup);
    this.getVariants.push(variantFormGroup);
    this.ref.detectChanges();
  }

  exportVariants(
    variant: any,
    hasVariant: boolean
  ): Partial<ProductSaveRequestVariant> {
    let result: Partial<ProductSaveRequestVariant> = {
      condition_desc: '',
      biz_status: variant.get('status')?.value,
      seller_sku: variant.get('sellerSku')?.value,
      track_qty: variant.get('trackQuantity')?.value,
      qty: this.util.safeNum(variant.controls['quantity'].value),
      buy_price: this.util.safeNum(variant.controls['price'].value),
      purchased_price: this.util.safeNum(
        variant.controls['purchasedPrice'].value
      ),
      compared_price: this.util.safeNum(
        variant.controls['comparedPrice'].value
      ),
      selling_price: this.util.safeNum(variant.get('sellingPrice')?.value),
      start_at: this.util.dateTransform(variant.get('dateRange')?.value?.start),
      expired_at: this.util.dateTransform(variant.get('dateRange')?.value?.end),
      prod_desc: variant.get('description')?.value,
      fk_condition_id: variant.get('condition')?.value?.id,
      features: variant.get('features')?.value.filter((e: any) => {
        return !this.util.isEmptyOrSpaces(e);
      }),
      attributes: (variant.get('attributes') as FormArray).controls
        .filter((attribute: AbstractControl<FormGroup>) => {
          if (
            attribute.get('allowDetailCustomName')?.value &&
            this.util.isEmptyOrSpaces(attribute.get('value')?.value)
          ) {
            return false;
          }
          if (
            attribute.get('needDetailMapping')?.value &&
            attribute.get('optionDetail')?.value == null
          ) {
            return false;
          }
          // if (
          //   attribute.get('optionUnit')?.value == null
          // ) {
          //   return false;
          // }
          return true;
        })
        .map((filteredAttribute: AbstractControl<FormGroup>) => {
          return {
            id: filteredAttribute.get('id')?.value,
            fk_varopt_hdr_id: (
              filteredAttribute.get('optionHeader')?.value as any
            )?.id,
            fk_varopt_dtl_id: (
              filteredAttribute.get('optionDetail')?.value as any
            )?.id,
            fk_varopt_unit_id: (
              filteredAttribute.get('optionUnit')?.value as any
            )?.id,
            value: filteredAttribute.get('value')?.value,
          };
        }),
      locations: variant.get('locations')?.value.map((loc: any) => {
        return {
          id: loc.id,
          fk_location_id: loc.locationId.toString(),
          quantity: this.util.safeNum(loc.quantity),
        };
      }),
      id: variant.value.id,
      media_1_image: variant.get('media_1_image')?.value?.id ?? null,
      media_2_image: variant.get('media_2_image')?.value?.id ?? null,
      media_3_image: variant.get('media_3_image')?.value?.id ?? null,
      media_4_image: variant.get('media_4_image')?.value?.id ?? null,
      media_5_image: variant.get('media_5_image')?.value?.id ?? null,
      media_6_image: variant.get('media_6_image')?.value?.id ?? null,
      media_7_image: variant.get('media_7_image')?.value?.id ?? null,
      media_8_video: variant.get('media_8_video')?.value?.id ?? null,
      media_9_video: variant.get('media_9_video')?.value?.id ?? null,
    };

    for (let i = 1; i <= 3; i++) {
      const hdrKey = `fk_varopt_${i}_hdr_id` as string;
      const dtlKey = `fk_varopt_${i}_dtl_id` as string;
      const unitKey = `fk_varopt_${i}_unit_id` as string;
      const valueKey = `var_${i}_title` as string;

      let varOpts: any = {};
      varOpts[hdrKey] = null;
      varOpts[dtlKey] = null;
      varOpts[unitKey] = null;
      varOpts[valueKey] = null;

      if (
        !this.util.isEmptyOrSpaces(
          variant.get('variantOptions')?.value[i - 1].get('header').value?.id
        )
      ) {
        varOpts[hdrKey] = hasVariant
          ? variant.get('variantOptions')?.value[i - 1].get('header').value?.id
          : null;
        varOpts[dtlKey] = hasVariant
          ? variant.get('variantOptions')?.value[i - 1].get('detail').value?.id
          : null;
        varOpts[unitKey] = hasVariant
          ? variant.get('variantOptions')?.value[i - 1].get('unit').value?.id
          : null;
        varOpts[valueKey] = hasVariant
          ? variant.get('variantOptions')?.value[i - 1].get('inputRef.name')
              ?.value
          : null;
      }
      Object.assign(result, varOpts);
    }
    return result;
  }

  exportVariant(variant: any, vMap: any) {
    return {
      biz_status: variant.get('status')?.value,
      seller_sku: variant.get('sellerSku')?.value,
      fk_varopt_1_hdr_id: vMap['fk_varopt_1_hdr_id'],
      fk_varopt_1_dtl_id: vMap['fk_varopt_1_dtl_id'],
      fk_varopt_1_unit_id: vMap['fk_varopt_1_unit_id'],
      var_1_title: vMap['var_1_title'],
      fk_varopt_2_hdr_id: vMap['fk_varopt_2_hdr_id'],
      fk_varopt_2_dtl_id: vMap['fk_varopt_2_dtl_id'],
      fk_varopt_2_unit_id: vMap['fk_varopt_2_unit_id'],
      var_2_title: vMap['var_2_title'],
      fk_varopt_3_hdr_id: vMap['fk_varopt_3_hdr_id'],
      fk_varopt_3_dtl_id: vMap['fk_varopt_3_dtl_id'],
      fk_varopt_3_unit_id: vMap['fk_varopt_3_unit_id'],

      var_3_title: vMap['var_3_title'],

      selling_price: this.util.safeNum(variant.get('sellingPrice')?.value),
      buy_price: this.util.safeNum(variant.controls['price'].value),
      purchased_price: this.util.safeNum(
        variant.controls['purchasedPrice'].value
      ),
      compared_price: this.util.safeNum(
        variant.controls['comparedPrice'].value
      ),
      track_qty: variant.get('trackQuantity')?.value,
      qty: this.util.safeNum(variant.controls['quantity'].value),
      condition_desc: '',
      start_at: this.util.dateTransform(variant.get('dateRange')?.value?.start),
      expired_at: this.util.dateTransform(variant.get('dateRange')?.value?.end),
      fk_condition_id: variant.get('condition')?.value?.id,
      prod_desc: variant.get('description')?.value,

      features: variant.get('features')?.value.filter((e: any) => {
        return !this.util.isEmptyOrSpaces(e);
      }),
      attributes: (variant.get('attributes') as FormArray).controls
        .filter((attribute: AbstractControl<FormGroup>) => {
          if (
            attribute.get('allowDetailCustomName')?.value &&
            this.util.isEmptyOrSpaces(attribute.get('value')?.value)
          ) {
            return false;
          }
          if (
            attribute.get('needDetailMapping')?.value &&
            attribute.get('optionDetail')?.value == null
          ) {
            return false;
          }
          return true;
        })
        .map((filteredAttribute: AbstractControl<FormGroup>) => {
          return {
            id: filteredAttribute.get('id')?.value,
            fk_varopt_hdr_id: (
              filteredAttribute.get('optionHeader')?.value as any
            )?.id,
            fk_varopt_dtl_id: (
              filteredAttribute.get('optionDetail')?.value as any
            )?.id,
            fk_varopt_unit_id: (
              filteredAttribute.get('optionUnit')?.value as any
            )?.id,
            value: filteredAttribute.get('value')?.value,
          };
        }),
      locations: variant.get('locations')?.value.map((loc: any) => {
        return {
          id: loc.id,
          fk_location_id: loc.locationId.toString(),
          quantity: this.util.safeNum(loc.quantity),
        };
      }),
      id: variant.value.id,
      media_1_image: variant.get('media_1_image')?.value?.id ?? null,
      media_2_image: variant.get('media_2_image')?.value?.id ?? null,
      media_3_image: variant.get('media_3_image')?.value?.id ?? null,
      media_4_image: variant.get('media_4_image')?.value?.id ?? null,
      media_5_image: variant.get('media_5_image')?.value?.id ?? null,
      media_6_image: variant.get('media_6_image')?.value?.id ?? null,
      media_7_image: variant.get('media_7_image')?.value?.id ?? null,
      media_8_video: variant.get('media_8_video')?.value?.id ?? null,
      media_9_video: variant.get('media_9_video')?.value?.id ?? null,
    } as any;
  }

  // << Utility >>

  // compare(a: any, b: any) {
  //   if (a && b) return a.id.toString() === b.id.toString();
  //   else return false;
  // }

  compareRandomSelect(a: number, b: number) {
    return a == b;
  }

  convertDecimal(el: any) {
    if (/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(el.target.value)) {
      el.target.value = parseFloat(el.target.value).toFixed(2);
    } else {
      el.target.value = '0.00';
    }
  }

  datePickerSelected(value: any, start: AbstractControl, end: AbstractControl) {
    start.setValue(value.start);
    end.setValue(value.end);
  }

  get optionHeaderTypeaheadConfig() {
    return {
      url: `categories/${
        this.categoryForm.get('data')?.value.lvl_id
      }/attributes`,
    };
  }

  formatter = (x: { id: string; title: string }) => x.title;

  identifyProductStatus() {
    // if (this.productForm.get('status')?.value == BizStatus.DEF) {
    //   this._productAlerts.set('def', ALERTS['def']);
    // }
    // this.productAlertsController.next(this._productAlerts);
  }

  submitProduct = async () => {
    let param: ProductSaveRequest = {
      id: this.productForm.value.id,
      biz_status: this.productForm.value.status,
      title: this.productForm.value.title,
      manufacture: this.productForm.value.manufacturer,
      brand: this.productForm.value.brand,
      package_qty: 0,
      fk_brand_id: this.authService.user.brand.id,
      fk_category_id: this.categoryForm.value.data?.id,
      fk_lvlcategory_id: this.categoryForm.value.data?.lvl_id,
      fk_packtype_id: this.productForm.value.packType?.id,
      fk_prod_group_id: null,
      fk_currency_id: this.productForm.value.currency?.id,
      fk_varopt_1_hdr_id: null,
      fk_varopt_2_hdr_id: null,
      fk_varopt_3_hdr_id: null,
      hasVariant: this.productForm.value.hasVariant,
      variants: [],
      fk_group_id: '',
      fk_purchased_currency_id: this.productForm.value.purchasedCurrency?.id,
    };

    for (let v of this.getVariants.controls) {
      if (!this.deletedProducts.has(v.get('id')?.value)) {
        param.variants.push(
          this.exportVariants(v, this.productForm.value.hasVariant)
        );
      }
    }

    // Prepare Variants of a product
    if (this.productForm.value.hasVariant) {
      param.fk_varopt_1_hdr_id = this.options[0].value.header?.id ?? null;
      param.fk_varopt_2_hdr_id = this.options[1].value.header?.id ?? null;
      param.fk_varopt_3_hdr_id = this.options[2].value.header?.id ?? null;
    }

    /** Deleted products import */
    for (const [key, value] of this.deletedProducts.entries()) {
      let delProd: any = this.exportVariants(value, param.hasVariant);
      delProd.biz_status = 4;
      param.variants.push(delProd);
    }

    /**
     * Validation
     */
    const hasMinActiveCount =
      param.variants.filter((value: any) => {
        return value.biz_status == BizStatus.ACTIVE;
      }).length > 0;
    if (!hasMinActiveCount) {
      this.popup.showTost('Please fill all data');
      return;
    }
    console.log('save ', param);
    const loadingRef = await this.popup.showLoading('Please wait');
    loadingRef.present();

    if (this.util.isEmptyID(param.id)) {
      this.saveProduct(param).subscribe({
        next: (response) => {
          loadingRef.dismiss();
          if (response.success) {
            this.popup.showTost('Success');
          } else {
            this.popup.showTost('Something went wrong');
          }
        },
        error: (e) => {
          loadingRef.dismiss();
          this.popup.showTost('Something went wrong');
          console.log(e.error);
        },
      });
    } else {
      this.updateProduct(param, param.id).subscribe({
        next: (response) => {
          loadingRef.dismiss();
          if (response.success) {
            this.popup.showTost('Success');
          } else {
            this.popup.showTost('Something went wrong');
          }
        },
        error: (e) => {
          loadingRef.dismiss();
          this.popup.showTost('Something went wrong');
          console.log(e.error);
        },
      });
    }
  };

  openProfitMarginCalculator(variant: AbstractControl) {
    const modalRef = this.modalService.open(ProfitMarginCalculatorComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.type = 'model';
    modalRef.componentInstance.costOfItem = variant.get('price')?.value;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.result.then((value: ProfitMarginResp | undefined) => {
      if (value) {
        variant.get('sellingPrice')?.setValue(value.salePrice);
        variant.get('price')?.setValue(value.costOfItem);
      }
    });
  }

  /** Variant by ID tab */

  initVariantById() {
    if (this.paramProductId && this.paramVariantId) {
      this.prepareVariantById(this.paramProductId, this.paramVariantId);
    } else return;
  }

  async prepareVariantById(productId: string, variantId: string) {
    const loadingRef = await this.popup.showLoading('Please wait');
    loadingRef.present();
    let variantResponse = await lastValueFrom(
      this.getVariantById(productId, variantId)
    ).then(
      (resp) => {
        if (resp.success) {
          return resp.details;
        } else return null;
      },
      (error) => {
        console.log(`GetVariantById[${productId}/${variantId}]`, error);

        return null;
      }
    );
    loadingRef.dismiss();
    if (variantResponse == null) {
      this.popup.showTost('Unable to get your product!');
      return;
    }
    this.variantsMap = new Map(Object.entries(variantResponse));
    this.variantsMap.forEach((value: any, key: string) => {
      value['title'] = [
        value.var_1_title,
        value.var_2_title,
        value.var_3_title,
      ].reduce((prev, current) => {
        return prev + (prev !== '' && current ? ' / ' : '') + (current ?? '');
      }, '');
    });
    this.importVitalInfoForm(variantResponse[variantId]['product']);

    let categoryLeave: CategoryLeave = {
      id: null,
      biz_status: 0,
      title: '',
      full_path: '',
      lft: 0,
      rgt: 0,
      lvl_id: null,
    };
    Object.assign(
      categoryLeave,
      variantResponse[variantId]['product']['category']
    );
    categoryLeave.lvl_id =
      variantResponse[variantId]['product']['fk_lvlcategory_id'];
    this.importCategory(categoryLeave);
    this.importCategory(variantResponse[variantId]['product']['category']);

    this.getVariants.clear();
    this.importVariant(variantResponse[variantId]);
  }

  routeChange(value: any) {
    const url = value.target.value;
    this.router.navigateByUrl(url);
  }

  submitVariant = () => {
    // only for product that has variants
    const vMap = this.variantsMap.get(this.paramVariantId as string);

    const param: any = this.getVariants.controls.map(
      (variant: AbstractControl<FormGroup>) => {
        return this.exportVariant(variant, vMap);
      }
    )[0];
    this.updateVariant(
      param,
      this.paramProductId as string,
      this.paramVariantId as string
    ).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.popup.showTost('Success');
        } else {
          this.popup.showTost('Unable to proceed your request');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  };
}
