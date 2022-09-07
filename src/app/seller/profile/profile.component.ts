import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
import { ControllerService } from 'src/app/services/controller.service';
import { User } from 'src/app/services/core';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('brandDetailInfo') public brandDetailInfoTabs!: any;

  accountForm: FormGroup = new FormGroup({
    id: new FormControl('-1'),
    mdate: new FormControl(''),
    cdate: new FormControl(''),
    firstName: new FormControl('', {validators:[Validators.required]}),
    lastName: new FormControl('', {validators:[Validators.required]}),
    email: new FormControl(),
    phoneNo: new FormControl('',{validators:[Validators.required]}),
    address: new FormControl('',{validators: Validators.required}),
    profileImage: new FormControl(),
    formStateEdit: new FormControl(false),
  });
  authenForm: FormGroup = new FormGroup({
    current_password: new FormControl(''),
    newPassword: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });
  brandForm: FormGroup = new FormGroup({
    id: new FormControl('-1'),
    publicId: new FormControl(''),
    title: new FormControl(''),
    status: new FormControl(-1),
    createdAt: new FormControl(''),
    updatedAt: new FormControl(''),
    profileImage: new FormControl(),
    coverImage: new FormControl(),
    formStateEdit: new FormControl(false),
  });

  mediaChooserConfigBrandCover: MediaChooserConfig = {
    pagination: 12,
    ratio: '5/1',
  };
  mediaChooserConfigBrandLogo: MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1',
  };
  mediaChooserConfigUserProfile: MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1',
  };

  get matchPassword():boolean {
    return this.authenForm.get('newPassword')?.value == this.authenForm.get('confirmPassword')?.value;
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
  mapAccount(acc: User) {
    this.accountForm.reset();
    this.accountForm.get('id')?.setValue(acc.id);
    this.accountForm.get('status')?.setValue(acc.status);
    this.accountForm.get('firstName')?.setValue(acc.first_name);
    this.accountForm.get('lastName')?.setValue(acc.last_name);
    this.accountForm.get('email')?.setValue(acc.email);
    this.accountForm.get('phoneNo')?.setValue(acc.phone);
    this.accountForm.get('address')?.setValue(acc.address);

    this.accountForm.get('profileImage')?.setValue(acc.profile_image);
  }
  mapBrand(brand: any) {
    this.brandForm.get('id')?.setValue(brand.id);
    this.brandForm.get('publicId')?.setValue(brand.public_id);
    this.brandForm.get('title')?.setValue(brand.title);
    this.brandForm
      .get('createdAt')
      ?.setValue(this.pgservice.dateFormat(brand.created_at));
    this.brandForm.get('updatedAt')?.setValue(brand.updated_at);
    this.brandForm.get('profileImage')?.setValue(brand.profile_image);
    this.brandForm.get('coverImage')?.setValue(brand.cover_image);
    console.log(this.brandForm.value);
  }

  cancelBrand() {
    this.brandForm.get('formStateEdit')?.setValue(false);
    this.brandDetailInfoTabs.select(1);
  }
  submitBrand() {
    const param = {
      title: this.brandForm.get('title')?.value,
      profile_image: this.brandForm.get('profileImage')?.value?.id,
      cover_image: this.brandForm.get('coverImage')?.value?.id,
    };
    this.http.PUT(`brands/${this.auth.user.brand.id}`, param).subscribe({
      next:(resp)=>{
        if(resp.status == 200){
          this.popup.showTost('Success!');
        }else {
          this.popup.showTost( resp.message);
        }
      },
      error:(error)=>{
        console.log(error);
      }
    })
    this.brandForm.get('formStateEdit')?.setValue(false);
    this.brandDetailInfoTabs.select(1);
  }
  saveAccount() {
    let param: Partial<User> = {
      first_name: this.accountForm.controls["firstName"].value,
      last_name: this.accountForm.controls["lastName"]?.value,
      profile_image: this.accountForm.controls["profileImage"].value?.id ?? null,
      email: this.accountForm.controls["email"].value,
      phone: this.accountForm.controls["phoneNo"].value,
      address: this.accountForm.controls["address"].value,
    };

    this.http.PUT(`users/${this.accountForm.controls["id"].value}`, param).subscribe(
      {
        next:(resp)=>{
          if(resp.status ==200) {
            this.popup.showTost('Success!');
          }else {
            this.popup.showTost(resp.message);
          }
        },
        error:(error)=>{

          console.log(error);
          
        }
      }
    )
  }
  brandLogoChange(value: any, formControlName: string) {
    this.brandForm.controls[formControlName].setValue(value);
  }
  UserProfileChange(value: any, formControlName: string) {
    this.accountForm.controls[formControlName].setValue(value);
    this.accountForm.markAsDirty();
  }
  submitChangePassword() {
    const param = {
      password: this.authenForm.get('newPassword')?.value
    }
    this.http.PUT('sessions/user/password',param).subscribe({
      next:(resp)=>{
        if(resp.status == 200){
          this.popup.showTost('Success');
        }else {
          this.popup.showTost(resp.message)
        }
      },
      error:(e)=>{
        this.popup.showTost(e)
        console.log(e);
        
      }
    })
  }
}
