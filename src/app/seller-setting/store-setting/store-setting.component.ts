import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-store-setting',
  templateUrl: './store-setting.component.html',
  styleUrls: ['./store-setting.component.scss'],
})
export class StoreSettingComponent implements OnInit, OnDestroy {
  appName = environment.name;
  currencies: any[] = [];
  industries: any[] = [];

  readonly updateableFields = {
    defCurrency: 'def_currency_id',
    industry: 'industry_id',
    phone: 'phone',
    sysEmail: 'sys_email',
    cusEmail: 'cus_email',
  };

  basic = new FormGroup({
    isEdit: new FormControl<boolean>(false),
    name: new FormControl(this.auth.user.brand.title),
    industry: new FormControl(),
  });

  storeCurrency = new FormGroup({
    isEdit: new FormControl<boolean>(false),
    defCurrency: new FormControl(),
  });

  contactInfo = new FormGroup({
    isEdit: new FormControl<boolean>(false),
    phone: new FormControl(''),
    sysEmail: new FormControl(''),
    cusEmail: new FormControl(''),
  });
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: ServerService,
    private auth: AuthService,
    private popup: PopupService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.getSettings().then((resp) => {
      if (!resp.success) return;

      this.initStoreCurrency(resp.details);
      this.initStoreBasic(resp.details);
      this.initStoreContact(resp.details);
    });
  }

  initStoreCurrency(setting: any) {
    this.getCurrencies().then((resp) => {
      if (resp.success) {
        this.currencies = resp.details.data;
      }
    });
    this.storeCurrency
      .get('defCurrency')
      ?.setValue(setting.default_currency, { emitEvent: false });

    this.storeCurrency
      .get('defCurrency')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((changes) => {
        this.storeCurrency.get('isEdit')?.setValue(true);
        console.log(changes);
      });
  }

  initStoreBasic(setting: any) {
    this.getIndustries().then((resp) => {
      this.industries = resp.details.data;
    });
    this.basic
      .get('industry')
      ?.setValue(setting.industry, { emitEvent: false });
  }

  initStoreContact(setting: any) {
    this.contactInfo
      .get('phone')
      ?.setValue(setting.phone, { emitEvent: false });
    this.contactInfo
      .get('sysEmail')
      ?.setValue(setting.sys_email, { emitEvent: false });
    this.contactInfo
      .get('cusEmail')
      ?.setValue(setting.cus_email, { emitEvent: false });
  }

  compare(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }

  // Form submition
  onSubmitBasic() {
    let param = {} as any;
    param[this.updateableFields.industry] =
      this.basic.get('industry')?.value?.id;
    this.updateSetting(param).then((resp) => {
      this.popup.showTost(resp.message);
      this.basic.get('isEdit')?.setValue(!resp.success);
    });
  }
  onSubmitCurrency() {
    let param = {} as any;
    param[this.updateableFields.defCurrency] =
      this.storeCurrency.get('defCurrency')?.value?.id;
    this.updateSetting(param).then((resp) => {
      this.popup.showTost(resp.message);
      this.storeCurrency.get('isEdit')?.setValue(!resp.success);
    });
  }
  onSubmitContact() {
    let param = {} as any;
    param[this.updateableFields.phone] = this.contactInfo.get('phone')?.value;
    param[this.updateableFields.sysEmail] =
      this.contactInfo.get('sysEmail')?.value;
    param[this.updateableFields.cusEmail] =
      this.contactInfo.get('cusEmail')?.value;
    this.updateSetting(param).then((resp) => {
      this.popup.showTost(resp.message);
      this.contactInfo.get('isEdit')?.setValue(!resp.success);
    });
  }

  // HTTP
  getCurrencies() {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('pagination', '-1');
    return lastValueFrom(this.http.GET('regions', httpParams));
  }

  getIndustries() {
    const depth = 2;
    let httpParams = new HttpParams();
    httpParams = httpParams.append('pagination', '-1');
    return lastValueFrom(
      this.http.GET(`categories-withdepth/${depth}`, httpParams)
    );
  }

  getSettings() {
    return lastValueFrom(this.http.GET('brand/setting'));
  }

  updateSetting(param: any) {
    return lastValueFrom(this.http.PUT('brand/setting', param));
  }
}
