import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ComponentFather } from 'src/app/services/component-father';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';
import { SellerService } from '../../seller/seller.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends ComponentFather implements OnInit {
  @ViewChild('nav') public nav!: any;

  /** UI controls */
  activeTabId = 1;
  phoneMaskConfig = {
    mask: '+{95} N',
    blocks: {
      N: {
        mask: /^[0-9]+$/,
      },
    },
  };

  /** FormGroups */
  brandFormGroup: FormGroup = new FormGroup({
    brandName: new FormControl('Apple', Validators.required),
    region: new FormControl(null, Validators.required),
    brandCover: new FormControl(),
    brandProfile: new FormControl(),
  });
  accountFormGroup: FormGroup = new FormGroup({
    userFirstName: new FormControl('', Validators.required),
    userLastName: new FormControl('', Validators.required),
    userEmail: new FormControl('', Validators.required),
    userPhNo: new FormControl('', Validators.required),
    userAddress: new FormControl(''),
    password: new FormControl('', Validators.required),
  });

  /** Lists */
  regions: any[] = [];

  constructor(
    private http: ServerService,
    private alert: PopupService,
    private sellerService: SellerService
  ) {
    super();
  }

  get tabPercentager() {
    const total = 100 / 2;
    const result = total * (this.activeTabId - 1);
    console.log(result);

    return result;
  }

  ngOnInit(): void {
    this.getRegions();
  }
  onChangeRegion(){   
    this.phoneMaskConfig.mask = `{${this.brandFormGroup.get('region')?.value?.dial_code}} N`
  }

  submit() {
    /* Common error */

    /* Send http request */
    const param = {
      brand: {
        title: this.brandFormGroup.get('brandName')?.value,
        region_id: '146',
        profile_image: null,
        cover_image: null,
      },
      user: {
        first_name: this.accountFormGroup.get('userFirstName')?.value,
        last_name: this.accountFormGroup.get('userLastName')?.value,
        email: this.accountFormGroup.get('userEmail')?.value,
        phone: this.accountFormGroup.get('userPhNo')?.value,
        address: this.accountFormGroup.get('userAddress')?.value,
        password: this.accountFormGroup.get('password')?.value,
      },
    };

    // return;
    this.http.POST('brands/register', param).subscribe({
      next: (res) => {
        console.log(res);

        if (res.success) {
          this.alert.showTost('Success');
        }
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  getRegions() {
    const regions = this.sellerService.regions([
      { key: 'pagination', value: '-1' },
    ]);
    lastValueFrom(regions).then((resp) => {
      if (resp.success) {
        this.regions = resp.details.data;
      }
    });
  }
}
