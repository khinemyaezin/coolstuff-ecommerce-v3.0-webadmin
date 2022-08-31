import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  accountForm: FormGroup = new FormGroup({
    id: new FormControl('-1'),
    mdate: new FormControl(''),
    cdate: new FormControl(''),

    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl(),
    phoneNo: new FormControl(),
    address: new FormControl(Validators.required),
    profileImage: new FormControl(),
  });
  authenForm: FormGroup = new FormGroup({
    current_password: new FormControl(''),
    new_password: new FormControl('', Validators.required),
    confirm_password: new FormControl('', Validators.required),
  });
  brandForm: FormGroup = new FormGroup({
    id: new FormControl('-1'),
    public_id: new FormControl(''),
    title: new FormControl(''),
    status: new FormControl(-1),
    created_at: new FormControl(''),
    updated_at: new FormControl(''),
    image_profile_url: new FormControl(),
    image_cover_url: new FormControl(),
  });

  mediaChooserConfigBrandCover : MediaChooserConfig = {
    pagination: 12,
    ratio:'5/1'
  }
  mediaChooserConfigBrandLogo : MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1'
  }
  constructor(
    private pgservice: ControllerService,
    public popup: PopupService,
    private http: ServerService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.mapAccount(this.auth.user);
    this.mapBrand(this.auth.user.brand);
  }
  mapAccount(acc: any) {
    this.accountForm.reset();
    this.accountForm.get('id')?.setValue(acc.id);
    this.accountForm.get('status')?.setValue(acc.status);
    this.accountForm.get('firstName')?.setValue(acc.first_name);
    this.accountForm.get('lastName')?.setValue(acc.last_name);
    this.accountForm.get('email')?.setValue(acc.email);
    this.accountForm.get('phoneNo')?.setValue(acc.phone);
    this.accountForm.get('address')?.setValue(acc.address);

    this.accountForm.get('profileImage')?.setValue(acc.image_url);
    this.accountForm.disable();
    this.authenForm.disable();
  }
  mapBrand(brand: any) {    
    this.brandForm.get('id')?.setValue(brand.id);
    this.brandForm.get('public_id')?.setValue(brand.public_id);
    this.brandForm.get('title')?.setValue(brand.title);
    this.brandForm.get('created_at')?.setValue( this.pgservice.dateFormat(brand.created_at));
    this.brandForm.get('updated_at')?.setValue(brand.updated_at);
    this.brandForm.get('image_profile_url')?.setValue(brand.image_profile_url);
    this.brandForm.get('image_cover_url')?.setValue(brand.image_cover_url);
    this.brandForm.disable();
  }
  saveBrand() {
    // const param = {
    //   title: this.brand_fg.get("name")?.value,
    //   image_profile_url: this.brand_fg.get("profileImage")?.value,
    //   image_cover_url: this.brand_fg.get("coverImage")?.value,
    // };
    // this.http
    //   .PUT(`brands/${this.auth.user.brand.id}`, param)
  }
  saveAccount() {
    // if (!this.account_info.valid) return;
    // let param: any = {
    //   first_name: this.account_info.controls["firstName"].value,
    //   last_name: this.account_info.controls["lastName"]?.value,
    //   image_url: this.account_info.controls["profileImage"].value,
    //   email: this.account_info.controls["email"].value,
    //   phone: this.account_info.controls["phoneNo"].value,
    //   address: this.account_info.controls["address"].value,
    // };
    // this.http.PUT(`users/${this.account_info.controls["id"].value}`, param)
  }
  brandLogoChange(value:any,formControlName:string){
    this.brandForm.controls[formControlName].setValue(value)    
  }
  submit() {}
}
