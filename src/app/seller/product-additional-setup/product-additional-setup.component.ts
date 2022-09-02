import {
  AfterViewInit,
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
import { ControllerService } from 'src/app/services/controller.service';
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
  switchMap,
  takeUntil,
} from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { MaskConfig } from 'src/app/services/core';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
interface MoreDetail {
  id: string;
  headerId: string;
  name: string;
  code: string;
  description: string;
  allowDetailCustomName: number;
  needDetailMapping: number;
  details: any[];
  units: any[];
  value: FormGroup;
}
@Component({
  selector: 'app-product-additional-setup',
  templateUrl: './product-additional-setup.component.html',
  styleUrls: ['./product-additional-setup.component.scss'],
})
export class ProductAdditionalSetupComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('nav') public tabs!: any;

  categoryForm: FormGroup = new FormGroup({
    categorySearch: new FormControl(''),
    categorySearchResult: new FormControl([]),
    categorySelected: new FormControl({ path: '' }),
    lvlCategory: new FormControl(null),
  });
  productForm: FormGroup = new FormGroup({
    id: new FormControl(),
    status: new FormControl(2),
    title: new FormControl('', { validators: Validators.required }),
    brand: new FormControl('', { validators: Validators.required }),
    manufacturer: new FormControl('', { validators: Validators.required }),
    packType: new FormControl(null, { validators: Validators.required }),
    currency: new FormControl(null, { validators: Validators.required }),
    variants: new FormArray([]),
    hasVariant: new FormControl(false),
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
  conditionOptions: any[] = [];
  packTypeList: any[] = [];
  currencyByRegions: any[] = [];
  deletedProducts = new Map();
  standAlone: any;
  options: any[] = [];
  attributes: FormArray = new FormArray<FormGroup>([]);
  isFilterFormCollapsed = true;
  checkedVariantCard = true;
  businessStatus = [
    { title: 'Active', value: 2 },
    { title: 'Draft', value: 6 },
  ];
  public maskConfig: MaskConfig = this.http.config.mask;

  destroy$: Subject<boolean> = new Subject<boolean>();

  get getVariants(): FormArray {
    return this.productForm.controls['variants'] as FormArray;
  }

  get buyCurrency() {
    return this.productForm.get('currency')?.value;
  }

  // get hasOptionHeaders() {
  //   return (
  //     this.options.reduce((prev: any, curr: any) => {
  //       return prev + curr.get('header')?.value ? 1 : 0;
  //     }, 0) !== 0
  //   );
  // }

  constructor(
    public pgService: ControllerService,
    private authService: AuthService,
    private http: ServerService,
    public fb: FormBuilder,
    public sellerService: SellerService,
    public popup: PopupService,
    public activatedRoute: ActivatedRoute,
    public router: Router
  ) {}

  ngAfterViewInit(): void {
    if (this.paramProductId) {
      this.tabs.select(2);
    } else {
      // test
      this.selectCategory({
        id: '19',
        biz_status: 2,
        title: 'Tops, T-Shirts & Shirts',
        depth: 5,
        path: 'root > Clohing, Shoes & Watches > Fashion > Man > Clothing > Tops, T-Shirts & Shirts',
        lft: 90,
        rgt: 91,
        level_category_id: 39,
        created_at: null,
        updated_at: null,
      });
      //this.productForm.controls['hasVariant'].setValue(true);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.init();
    const routeParams = this.activatedRoute.snapshot.paramMap;
    const id = routeParams.get('id');
    this.paramProductId = id;
    this.standAlone = this.createVariant();
    if (id) {
      this.importProduct(id, null);
    } else {
      this.getVariants.push(this.standAlone);
    }

    // sample
    //this.getVariants.push(this.createVariant());
    //this.productForm.valueChanges.subscribe((changes) => console.log(changes));
  }

  init() {
    this.browseCategory();
    this.createOptionGroup();
    this.onChangeVariantCheckBox();

    const getCondition = this.http.GET('conditions');
    const getPackTypes = this.http.GET('packtypes');
    const regions = this.sellerService.regions([
      { key: 'pagination', value: '-1' },
    ]);

    forkJoin([getCondition, getPackTypes, regions]).subscribe(
      (values: any[]) => {
        if (values[0] && values[0].status == 200) {
          this.conditionOptions = values[0].details.data;
        }
        if (values[1] && values[1].status == 200) {
          this.packTypeList = values[1].details.data;
        }
        if (values[2] && values[2].status == 200) {
          this.currencyByRegions = values[2].details.data;

          // Set default currency value by brand;
          this.productForm.controls['currency'].setValue(
            this.currencyByRegions.find(
              (r) => r.id == this.authService.user.brand.fk_region_id
            )
          );
        }
      }
    );

    // this.vitalInfoForm
    //   .get('status')
    //   ?.valueChanges.pipe(takeUntil(this.destroy$))
    //   .subscribe((value: any) => {
    //     if (value == BizStatus.ACTIVE) this._productAlerts.delete('def');
    //     else {
    //       this._productAlerts.set('def', ALERTS['def']);
    //     }
    //     this.productAlertsController.next(this._productAlerts);
    //   });
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
  }

  /** Category */

  browseCategory() {
    this.categoryForm.controls['categorySearch'].valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((changes: any) => {
        if (this.pgService.isEmptyOrSpaces(changes)) {
          this.categoryForm.controls['categorySearchResult'].setValue([]);
        } else {
          // Request categories.
          lastValueFrom(this.getCategory(changes)).then((resp: any) => {
            //$('#browse-category').removeClass('query');
            if (resp.status == 200) {
              //$('#browse-category').removeClass('query');
              this.categoryForm.get('categorySearchResult')?.setValue(
                resp.details.map((category: any) => {
                  category.path = category.path.replace(
                    new RegExp('/', 'g'),
                    ' > '
                  );
                  return category;
                })
              );
            }
          });
        }
      });
  }

  selectCategory(category: any) {
    this.importCategory(category);

    // Get attributes by category
    const getDepAttri = this.getAttributes(
      '',
      this.categoryForm.value.categorySelected.level_category_id,
      'optionDetails,optionUnits'
    );

    forkJoin([getDepAttri]).subscribe((values: any[]) => {
      if (values[0] && values[0].status == 200) {
        values[0].details.data.forEach((header: any) => {
          const attribute = this.fb.group({
            id: new FormControl('-1'),
            headerId: new FormControl(header.id),
            name: new FormControl(header.title),
            code: new FormControl(header.code),
            description: new FormControl(),
            allowDetailCustomName: new FormControl(
              header.allow_dtls_custom_name
            ),
            needDetailMapping: new FormControl(header.need_dtls_mapping),
            details: new FormControl(header.option_details),
            units: new FormControl(
              header.option_units ? header.option_units : []
            ),
            //value: this.createAttribute() as FormGroup,
          });
          this.attributes.push(attribute);
        });
      }

      this.tabs.select(2);
    });
  }

  importCategory(category: any) {
    this.categoryForm.controls['categorySearch'].setValue('');
    this.categoryForm.controls['categorySearchResult'].setValue([]);
    this.categoryForm.controls['lvlCategory'].setValue(category);
    // category.category.path = (<string>category.path).replace(
    //   new RegExp('/', 'g'),
    //   ' > '
    // );
    this.categoryForm.controls['categorySelected'].setValue(category);
    console.log('category', this.categoryForm.value);
  }

  /** Description */

  addFeatures(i: number, e: any, variant: FormGroup) {
    if (e.key === 'Enter' || e.keyCode === 13) {
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

  private createAttribute(attribute: any) {
    return new FormGroup({
      id: new FormControl(attribute.id),
      title: new FormControl(),
      allowDetailCustomName: new FormControl<boolean>(
        attribute.allow_dtls_custom_name
      ),
      needDetailMapping: new FormControl<boolean>(attribute.need_dtls_mapping),
      optionHeader: new FormControl<any>({
        id: attribute.fk_varopt_hdr_id,
        title: attribute.title,
      }),
      optionDetailArray: new FormControl([]),
      optionDetail: new FormControl(attribute?.fk_varopt_dtl_id, {
        validators: Validators.required,
      }),
      optionUnitArray: new FormControl([]),
      optionUnit: new FormControl(attribute?.fk_varopt_unit_id),
      value: new FormControl(),
    });
  }

  importAttributesToDefaultVariant(lvlCategoryId: string, variants: FormArray) {
    lastValueFrom(this.http.GET(`categories/${lvlCategoryId}/attributes`)).then(
      (resp: any) => {
        if (resp.status == 200) {
          variants.controls.forEach((variant) => {
            (variant.get('attributes') as FormArray).clear();
            resp.details.data.forEach((attribute: any) => {
              Object.assign(attribute,{
                fk_varopt_hdr_id: attribute.id,
              });
              (variant.get('attributes') as FormArray).push(
                this.createAttribute(attribute)
              );
            });
          });
        }
      }
    );
  }

  // getOptionDetails(optionHeaderId: string, attribute: FormGroup) {
  //   alert('hi');
  //   if (attribute.get('optionDetailArray')?.value.length != 0) return;
  //   this.getVariantOptionItems(optionHeaderId).subscribe({
  //     next: (value) => {
  //       if (value.status == 200) {
  //         attribute.get('optionDetailArray')?.setValue(value.details.data);
  //       }
  //     },
  //     error: (err) => {},
  //   });
  // }

  /** Variants */

  private createVariantOptionItem(
    optionOrder: number,
    name: string = '',
    id: number = this.pgService.randomInt(1, 1000)
  ) {
    let formGroup = this.fb.group({
      id: new FormControl(id),
      name: new FormControl(name),
      error: new FormControl({ isError: false, message: 'hello' }),
      optionOrder: new FormControl(optionOrder),
    });
    this.changeVariantOption(optionOrder, formGroup);
    return formGroup;
  }

  private createVariant(
    hdr1: any = null,
    title1: any = null,
    hdr2: any = null,
    title2: any = null,
    hdr3: any = null,
    title3: any = null
  ): FormGroup {
    let product = this.fb.group({
      formId: new FormControl(this.pgService.randomInt(1, 1000)),
      selected: new FormControl(false),
      edit: new FormControl(false),
      id: new FormControl('-1'),
      status: new FormControl(2),
      sellerSku: new FormControl(''),
      variantOptions: new FormControl([
        this.fb.group({
          header: new FormControl(hdr1),
          detail: new FormControl('', { validators: Validators.required }),
          inputRef: title1,
        }),
        this.fb.group({
          header: new FormControl(hdr2),
          detail: new FormControl('', { validators: Validators.required }),
          inputRef: title2,
        }),
        this.fb.group({
          header: new FormControl(hdr3),
          detail: new FormControl('', { validators: Validators.required }),
          inputRef: title3,
        }),
      ]),
      price: new FormControl(0),
      sellingPrice: new FormControl(0),
      quantity: new FormControl(0),
      dateRange: new FormControl({ start: new Date(), end: new Date() }),
      condition: new FormControl(),
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
    });
    return product;
  }

  onChangeVariantCheckBox() {
    this.productForm.controls['hasVariant'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((change: boolean) => {
        this.switchStandAloneOrVariants(change);
      });
  }

  switchStandAloneOrVariants(checked: boolean) {
    this.getVariants.clear();
    if (!checked) {
      this.getVariants.push(this.standAlone);
    }
  }

  removeVariantOptionHeader(optionIndex: number) {
    if (!this.options[optionIndex].get('header')?.value) return;

    let variantsFormArray = this.getVariants;
    let optionsItems = <FormArray>this.options[optionIndex].get('list');
    let optionIdIndexZero = optionsItems.controls[0].get('id')?.value;

    const indexArray = [...Array(this.options.length).keys()];
    indexArray.splice(optionIndex, 1);
    const desiredIndex = [...indexArray, optionIndex];

    for (let i = variantsFormArray.controls.length - 1; i >= 0; i--) {
      const optionIdInVariants = variantsFormArray.controls[i]
        .get('variantOptions')
        ?.value[optionIndex].get('inputRef.id')?.value;

      const variantId = variantsFormArray.controls[i].get('id')?.value;

      if (optionIdInVariants !== optionIdIndexZero) {
        if (!this.pgService.isEmptyID(variantId)) {
          this.deletedProducts.set(variantId, variantsFormArray.controls[i]);
        }
        variantsFormArray.removeAt(i);
      } else {
        /** Reorder options array of a product */

        let optionItemsInVariant =
          variantsFormArray.controls[i].get('variantOptions')?.value;

        this.reorder(
          optionItemsInVariant,
          desiredIndex,
          optionItemsInVariant.length
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
    this.options[this.options.length - 1].get('header').setValue(null);
    (<FormArray>this.options[this.options.length - 1].get('list')).clear();

    /** check */
    const isLastOption = this.options.reduce(
      (previous: number, current: FormGroup) => {
        return previous + (current.get('header')?.value ? 1 : 0);
      },
      0
    );
    if (isLastOption == 0) {
      this.getVariants.controls.forEach((e) => {
        if (!this.pgService.isEmptyID(e.get('id')?.value)) {
          this.deletedProducts.set(e.get('id')?.value, e);
        }
      });
      this.productForm.get('hasVariant')?.setValue(false);
    }
    this.checkedVariantCard = !this.hasOptionHeaders();
    this.switchStandAloneOrVariants(false);
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
  }

  onSelectVariantOption(optionGroup: FormGroup, optionOrderIndex: number) {
    console.log(optionGroup);

    //Reset
    const optionItems = optionGroup.controls['list'] as FormArray;
    optionItems.clear();
    optionItems.push(this.createVariantOptionItem(optionOrderIndex));

    this.checkedVariantCard = !this.hasOptionHeaders();
  }

  onChangeOptionItem(
    optionIndex: number,
    optionInputIndex: number,
    option: any,
    event: any
  ) {
    if (event.keyCode == 13 || event.keyCode == 9) return;
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
      this.options.push(
        new FormGroup({
          header: new FormControl(null, { validators: Validators.required }),
          list: new FormArray([]),
        })
      );
    }
    //sample
  }

  removeVariantOption(optionIndex: number, optionInputIndex: number) {
    let productFormArray = this.getVariants;
    const optionId = this.options[optionIndex].get(
      'list.' + optionInputIndex + '.id'
    )?.value;
    for (let i = productFormArray.controls.length - 1; i >= 0; i--) {
      const id = productFormArray.controls[i]
        .get('variantOptions')
        ?.value[optionIndex].get('inputRef.id')?.value;
      const prodId = productFormArray.controls[i].get('id')?.value;
      if (id && optionId == id) {
        if (this.pgService.isEmptyID(prodId)) {
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
          this.pgService.randomString(
            this.filterControlForm.value.randomIdLength
          )
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
      this.removeVariantFromProduct();
      return;
    }

    if (!this.pgService.isEmptyID(variant.get('id')?.value)) {
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

  async removeVariantFromProduct() {
    this.getVariants.controls.forEach((e) => {
      if (!this.pgService.isEmptyID(e.get('id')?.value)) {
        this.deletedProducts.set(e.get('id')?.value, e);
      }
    });
    (this.options[0] as FormGroup).reset();
    // .get('header')?.setValue(null);
    // (this.options[0].get('list') as FormArray).clear();
    this.productForm.get('hasVariant')?.setValue(false);
    this.checkedVariantCard = !this.hasOptionHeaders();
    console.log('deletedProducts', this.deletedProducts);
  }

  changeVariantOption(optionIndex: number, optionItem: FormGroup) {
    optionItem.controls['name'].valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe((changes: any) => {
        if (!this.pgService.isEmptyOrSpaces(changes)) {
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
                return !this.pgService.isEmptyOrSpaces(v.get('name')?.value);
              });
            let thirdOptionItems = this.options[2]
              .get('list')
              .controls.filter((v: any) => {
                return !this.pgService.isEmptyOrSpaces(v.get('name')?.value);
              });
            this.applyVariantOption(
              firstOptionItems,
              secondOptionItems,
              thirdOptionItems
            );
          } else if (optionIndex == 1) {
            /** Add line to products array */
            /** Check Option index if 0 just add it to product */
            if (this.options[1].get('list').controls.indexOf(optionItem) == 0) {
              //this.option2 = this.variationForm.controls["secondTheme"].value;
              this.applyVariantOptionIndex0(optionItem, optionIndex);
            } else {
              let firstOptionItems = this.options[0]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.pgService.isEmptyOrSpaces(v.get('name')?.value);
                });
              let secondOptionItems = [optionItem];
              let thirdOptionItems = this.options[2]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.pgService.isEmptyOrSpaces(v.get('name')?.value);
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
                  return !this.pgService.isEmptyOrSpaces(v.get('name')?.value);
                });
              let secondOptionItems = this.options[1]
                .get('list')
                .controls.filter((v: any) => {
                  return !this.pgService.isEmptyOrSpaces(v.get('name')?.value);
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
      'variants,myBrand,category,packType,currency,variantOption1Hdr,variantOption2Hdr,variantOption3Hdr'
    );
    httpParam = httpParam.set(
      'variants',
      'media_1_image,media_2_image,media_3_image,media_4_image,media_5_image,media_6_image,media_7_image,media_8_video,media_9_video,variantOption1Dtl,variantOption2Dtl,variantOption3Dtl'
    );
    return this.http.GET(`products/${id}`, httpParam);
  }

  /** Import ----------------------------------------------------------- */

  async importProduct(productId: any, variantId: any) {
    let loading = await this.popup.showLoading('please wait').then((e: any) => {
      return e;
    });
    loading.present();
    const product = await lastValueFrom(
      this.getProductById(productId, variantId)
    )
      .then((result: any) => {
        return result.status == 200 ? result.details : null;
      })
      .catch(() => {
        return null;
      });
    this.importVitalInfoForm(product);
    this.importCategory(product.category);
    //this.importAttributes(product);
    //this.importDescription(product, variantId);
    await this.importVariants(product);
    this.checkedVariantCard = !this.hasOptionHeaders();
    //this.identifyProductStatus();
    loading.dismiss();
  }

  async importVariants(data: any) {
    this.productForm.controls['hasVariant'].setValue(
      data.variant_option1_hdr ? true : false,
      {
        emitEvent: false,
      }
    );
    if (this.productForm.controls['hasVariant'].value) {
      for (let i = 0; i < this.options.length; i++) {
        let optionHeader = data['variant_option' + (i + 1) + '_hdr'];

        if (optionHeader) {
          let optionItems = this.options[i].get('list') as FormArray;
          this.options[i].get('header').setValue(optionHeader); //Set global option 1.

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
          option.get('detail')?.setValue(variant.variant_option1_dtl);
          option.get('header')?.setValue(this.options[i].get('header')?.value);
        }
      );
      variantFormGroup.controls['condition'].setValue({
        id: variant.fk_condition_id,
      });
      variantFormGroup.controls['price'].setValue(variant.buy_price);
      variantFormGroup.controls['sellingPrice'].setValue(variant.selling_price);
      variantFormGroup.controls['quantity'].setValue(variant.qty);
      variantFormGroup.controls['sellerSku'].setValue(variant.seller_sku);
      variantFormGroup.controls['dateRange'].setValue({
        start: this.pgService.dateFormat(variant.start_at),
        end: this.pgService.dateFormat(variant.expired_at),
      });

      if (variant.attributes) {
        (variantFormGroup.controls['attributes'] as FormArray).clear();
        variant.attributes.forEach((attribute: any) => {
          (variantFormGroup.controls['attributes'] as FormArray).push(
            this.createAttribute(attribute)
          );
        });
      }

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
      this.standAlone = variantFormGroup;
      this.getVariants.push(variantFormGroup);
    }
    if (this.productForm.controls['hasVariant'].value) {
      this.importAttributesToDefaultVariant(
        this.categoryForm.get('categorySelected')?.value.level_category_id,
        this.getVariants)
    }
  }

  /* Utility */

  compare(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }

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
        this.categoryForm.get('categorySelected')?.value.level_category_id
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

  submit() {
    console.log(this.productForm);
  }
}
