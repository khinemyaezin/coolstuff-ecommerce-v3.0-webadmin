import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { last, lastValueFrom, Observable, Subject, takeUntil } from 'rxjs';
import { ControllerService } from 'src/app/services/controller.service';
import { InvalidRouteError } from 'src/app/services/invalid-route-error';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';
import { SellerService } from '../../seller/seller.service';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss'],
})
export class LocationDetailComponent implements OnInit, OnDestroy {
  locationFormGroup = new FormGroup({
    id: new FormControl('-1'),
    title: new FormControl('', { validators: Validators.required }),
    region: new FormControl<any>(null, Validators.required),
    address: new FormControl(''),
    apartment: new FormControl(''),
    phone: new FormControl(''),
  });
  regions:any[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    public activatedRoute: ActivatedRoute,
    private http: ServerService,
    private pgService: ControllerService,
    private popup : PopupService,
    private sellerService:SellerService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    const param: Observable<any> = this.activatedRoute.params;
    param.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.redirect(id);
    });

    //Default http call
    this.getRegions();
  }

  redirect(value: { id: string }) {
    if (value && value.id == 'new') {
    } else if (value.id && /^\d+$/.test(value.id)) {
      const id = value.id;
      lastValueFrom(this.getLocationById(id)).then((resp: any) => {
        this.importLocation(resp);
      });
    } else {
      throw new InvalidRouteError();
    }
  }

  importLocation(resp: any) {
    if (resp.success) {
      this.locationFormGroup.get('id')?.setValue(resp.details.id);
      this.locationFormGroup
        .get('title')
        ?.setValue(resp.details.title, { emitEvent: false });
      this.locationFormGroup
        .get('region')
        ?.setValue(resp.details.region, { emitEvent: false });
      this.locationFormGroup
        .get('address')
        ?.setValue(resp.details.address, { emitEvent: false });
      this.locationFormGroup
        .get('apartment')
        ?.setValue(resp.details.apartment, { emitEvent: false });
      this.locationFormGroup
        .get('phone')
        ?.setValue(resp.details.phone, { emitEvent: false });
        
    }
  }

  compare(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }

  submit() {
    const id = this.locationFormGroup.get('id')?.value;
    const param = {
      title: this.locationFormGroup.get('title')?.value,
      region_id: this.locationFormGroup.get('region')?.value.id,
      address: this.locationFormGroup.get('address')?.value,
      apartment: this.locationFormGroup.get('apartment')?.value,
      phone: this.locationFormGroup.get('phone')?.value,
    };
    
    if (this.pgService.isEmptyID(id)) {
      lastValueFrom(this.saveLocation(param)).then(
        (resp)=>{
          if(resp.success) {
            this.popup.showSuccessToast("Success");
          }else {
            this.popup.showTost(resp.message)
          }
        }
      );
    }else {
      lastValueFrom(this.updateLocation(param,id as string)).then(
        (resp:any)=>{
          if(resp.success) {
            this.popup.showSuccessToast("Success");
          }else {
            this.popup.showTost(resp.message)
          }
        }
      );
    }
  }

  /** HTTPS */
  getLocationById(id: string) {
    let httpParam = new HttpParams();
    httpParam = httpParam.append('relationships', 'region');
    return this.http.GET(`locations/${id}`, httpParam);
  }

  getRegions() {
    const regions = this.sellerService.regions([
      { key: 'pagination', value: '-1' },
    ]);
    lastValueFrom(regions).then(
      (resp)=>{
        if(resp.success) {
          this.regions = resp.details.data;
        }
      }
    )
  }
  saveLocation(param: any) {
    return this.http.POST('locations', param);
  }
  updateLocation(param: any,id:string) {
    return this.http.PUT(`locations/${id}`, param);
  }
}
