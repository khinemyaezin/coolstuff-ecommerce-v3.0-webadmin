import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  debounceTime,
  lastValueFrom,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  Pagination,
  PaginationComponent,
} from 'src/app/core-components/pagination/pagination.component';
import { Utility } from 'src/app/services/utility.service';
import { BizStatus } from 'src/app/services/core';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-product-properties-detail',
  templateUrl: './product-properties-detail.component.html',
  styleUrls: ['./product-properties-detail.component.scss'],
})
export class ProductPropertiesDetailComponent implements OnInit {
  @ViewChild('nav') private navRef: any;
  headerFormGroup: FormGroup = new FormGroup({
    id: new FormControl(null),
    bizStatus: new FormControl(BizStatus.ACTIVE),
    title: new FormControl('', Validators.required),
    allowDtlsCustomName: new FormControl<boolean>(false, Validators.required),
    needDtlsMapping: new FormControl<boolean>(false, Validators.required),

    details: new FormArray([]),
    units: new FormArray([]),
  });
  details: any[] = [];
  detailsFilter: FormControl = new FormControl('');
  detailsPagination!: Pagination;

  units: any[] = [];
  unitsFilter: FormControl = new FormControl('');
  unitsPagination!: Pagination;

  destroy$: Subject<boolean> = new Subject<boolean>();
  deletedStatus = BizStatus.DELETED;
  activeStatus = BizStatus.ACTIVE;

  get getNewDetails() {
    return <FormArray>this.headerFormGroup.get('details');
  }

  get reachMaxNewDetails() {
    return this.getNewDetails.controls.length == 10;
  }

  get getNewUnits() {
    return <FormArray>this.headerFormGroup.get('units');
  }

  get reachMaxNewUnits() {
    return this.getNewDetails.controls.length == 10;
  }

  constructor(
    private http: ServerService,
    private pgService: Utility,
    public activatedRoute: ActivatedRoute,
    private popup: PopupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const param: Observable<string | null> = this.activatedRoute.params.pipe(
      map((p: any) => {
        return p.id;
      })
    );
    param.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      if (id && id == 'new') {
      } else if (id && /^\d+$/.test(id)) {
        lastValueFrom(this.getOptionHeader(id))
          .then((resp: any) => {
            if (this.importHeader(resp).success) {
              lastValueFrom(this.getOptionDetails(id)).then((resp: any) => {
                this.importDetailList(resp);
                if (resp.details.total == 0) {
                  //this.navRef.select(2);
                }
              });
              lastValueFrom(this.getOptionUnits(id)).then((resp: any) => {
                this.importUnitsList(resp);
                if (resp.details.total == 0) {
                  //this.navRef.select(2);
                }
              });
            } else {
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        this.router.navigateByUrl('/404');
      }
    });
    this.detailsFilter.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((changes: string) => {
        lastValueFrom(
          this.getOptionDetails(this.headerFormGroup.get('id')?.value, [
            {
              key: 'title',
              value: changes,
            },
          ])
        ).then((resp: any) => {
          this.importDetailList(resp);
        });
      });
  }

  importHeader(resp: any) {
    if (resp.success) {
      //this.headerFormGroup.reset();
      this.headerFormGroup.get('id')?.setValue(resp.details.id);
      this.headerFormGroup.get('bizStatus')?.setValue(resp.details.biz_status);
      this.headerFormGroup.get('title')?.setValue(resp.details.title);
      this.headerFormGroup
        .get('allowDtlsCustomName')
        ?.setValue(resp.details.allow_dtls_custom_name);
      this.headerFormGroup
        .get('needDtlsMapping')
        ?.setValue(resp.details.need_dtls_mapping);
    }
    return resp;
  }

  initDetailTab() {}

  // Details
  createChild() {
    return new FormGroup({
      id: new FormControl(null),
      status: new FormControl(BizStatus.ACTIVE),
      bizStatus: new FormControl(BizStatus.ACTIVE),
      code: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      varoptHdrId: new FormControl<string>(''),
      createdAt: new FormControl(new Date()),
      updatedAt: new FormControl(new Date()),
    });
  }

  importDetail(detail: any, detailFormGroup: FormGroup) {
    detailFormGroup.get('id')?.setValue(detail.id);
    detailFormGroup.get('status')?.setValue(detail.status);
    detailFormGroup.get('bizStatus')?.setValue(detail.biz_status);
    detailFormGroup.get('code')?.setValue(detail.code);
    detailFormGroup.get('title')?.setValue(detail.title);
    detailFormGroup.get('varoptHdrId')?.setValue(detail.fk_varopt_hdr_id);
    detailFormGroup.get('createdAt')?.setValue(detail.created_at);
    detailFormGroup.get('updatedAt')?.setValue(detail.updated_at);
    return detailFormGroup;
  }

  importDetailList(resp: any) {
    if (resp.success) {
      this.details = resp.details.data.map((value: any) => {
        value.created_at = this.pgService.dateFormat(value.created_at);
        value.updated_at = this.pgService.dateFormat(value.updated_at);
        return value;
      });
      this.detailsPagination = PaginationComponent.convertPaginationObject(
        resp.details
      );
    }
  }

  detailPageChange(url: any) {
    if (url) {
      lastValueFrom(this.http.fetch(url)).then((resp) =>
        this.importDetailList(resp)
      );
    }
  }

  addNewDetail() {
    if (this.getNewDetails.controls.length == 10) return;
    this.getNewDetails.push(this.createChild());
  }

  removeNewItem(index: number) {
    this.getNewDetails.removeAt(index);
  }

  addToDetailEdit(item: any, status: number = BizStatus.ACTIVE) {
    if (
      this.getNewDetails.controls.findIndex(
        (option: AbstractControl) => option.get('id')?.value == item.id
      ) == -1
    ) {
      item.biz_status = status;
      this.getNewDetails.insert(0, this.importDetail(item, this.createChild()));
    }
  }

  // Units
  importUnitsList(resp: any) {
    if (resp.success) {
      this.units = resp.details.data.map((value: any) => {
        value.created_at = this.pgService.dateFormat(value.created_at);
        value.updated_at = this.pgService.dateFormat(value.updated_at);
        return value;
      });
      this.unitsPagination = PaginationComponent.convertPaginationObject(
        resp.details
      );
    }
  }
  unitPageChange(url: any) {
    if (url) {
      lastValueFrom(this.http.fetch(url)).then((resp) =>
        this.importDetailList(resp)
      );
    }
  }
  addNewUnit() {
    if (this.getNewUnits.controls.length == 10) return;
    this.getNewUnits.push(this.createChild());
  }
  removeNewUnit(index: number) {
    this.getNewUnits.removeAt(index);
  }
  addToUnitEdit(item: any, status: number = BizStatus.ACTIVE) {
    if (
      this.getNewUnits.controls.findIndex(
        (option: AbstractControl) => option.get('id')?.value == item.id
      ) == -1
    ) {
      item.biz_status = status;
      this.getNewUnits.insert(0, this.importDetail(item, this.createChild()));
    }
  }
  /**
   * HTTP
   */
  getOptionHeader(id: string, param?: { key: string; value: any }[]) {
    let hparam = new HttpParams();
    param?.forEach((value) => {
      hparam = hparam.append(value.key, value.value);
    });
    return this.http.GET(`options/headers/${id}`, hparam);
  }

  getOptionDetails(headerId: string, param?: { key: string; value: any }[]) {
    let httpParam = new HttpParams();
    param?.forEach((filter) => {
      httpParam = httpParam.append(filter.key, filter.value);
    });
    return this.http.GET(`options/headers/${headerId}/details`, httpParam);
  }

  getOptionUnits(headerId: string, param?: { key: string; value: any }[]) {
    let httpParam = new HttpParams();
    param?.forEach((filter) => {
      httpParam = httpParam.append(filter.key, filter.value);
    });
    return this.http.GET(`options/headers/${headerId}/units`, httpParam);
  }
  updateOption(id: string, param: any) {
    return this.http.PUT(`options/headers/${id}`, param);
  }
  saveOptionHeader(param: any) {
    return this.http.POST(`options/headers`, param);
  }

  submit() {
    let param = {
      id: this.headerFormGroup.get('id')?.value,
      title: this.headerFormGroup.get('title')?.value.trim(),
      allow_dtls_custom_name: this.headerFormGroup.get('allowDtlsCustomName')
        ?.value,
      need_dtls_mapping: this.headerFormGroup.get('needDtlsMapping')?.value,
    };
    if (param.id) {
      Object.assign(param, {
        details: this.getNewDetails.controls
          .filter((optionObj: AbstractControl) => {
            return optionObj.valid;
          })
          .map((option: AbstractControl) => {
            return {
              id: option.get('id')?.value,
              biz_status: option.get('bizStatus')?.value,
              title: option.get('title')?.value.trim(),
              code: option.get('code')?.value.trim(),
            };
          }),
      });
      Object.assign(param, {
        units: this.getNewUnits.controls
          .filter((optionObj: AbstractControl) => {
            return optionObj.valid;
          })
          .map((option: AbstractControl) => {
            return {
              id: option.get('id')?.value,
              biz_status: option.get('bizStatus')?.value,
              title: option.get('title')?.value.trim(),
              code: option.get('code')?.value.trim(),
            };
          }),
      });
      this.updateOption(param.id, param).subscribe({
        next: (response) => {
          if (response.success) {
            this.popup.showTost('Success');
            this.getNewDetails.clear();
            lastValueFrom(this.getOptionDetails(param.id)).then((resp: any) => {
              this.importDetailList(resp);
            });
          } else {
            this.popup.showTost(response.message);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.popup.showTost(error.message);
        },
      });
    } else {
      this.saveOptionHeader(param).subscribe({
        next: (response) => {
          if (response.success) {
            this.popup.showTost('Success');
            this.router.navigateByUrl(
              `/admin/product-properties/${response.details.id}`
            );
          } else {
            this.popup.showTost(response.message);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.popup.showTost(error.message);
        },
      });
    }
    console.log(param);
  }
}
