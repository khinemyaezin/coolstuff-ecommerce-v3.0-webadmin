import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Utility } from 'src/app/services/utility.service';
import { User, UserTypes } from 'src/app/services/core';
import { PopupService } from 'src/app/services/popup.service';
import { UserSaveRequest } from 'src/app/services/requests';
import { ServerService } from 'src/app/services/server.service';
import { MediaChooserConfig } from '../media-chooser/media-chooser.component';

@Component({
  selector: 'user-profile-component',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  @Input('id') id!: string;
  @Input('type') type!: string;
  @Input('userType') userType!: UserTypes;
  @Input('title') title!: string;

  accountForm: FormGroup = new FormGroup({
    id: new FormControl(this.id),
    mdate: new FormControl(''),
    cdate: new FormControl(''),
    firstName: new FormControl('', { validators: [Validators.required] }),
    lastName: new FormControl('', { validators: [Validators.required] }),
    email: new FormControl('', { validators: [Validators.required] }),
    phoneNo: new FormControl('', { validators: [Validators.required] }),
    address: new FormControl(''),
    profileImage: new FormControl(),
    password: new FormControl(),
    formStateEdit: new FormControl(false),
  });
  mediaChooserConfigUserProfile: MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1',
  };

  constructor(
    public popup: PopupService,
    private http: ServerService,
    private util: Utility,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    if (this.util.isEmptyID(this.id)) {
      this.accountForm.get('password')?.addValidators([Validators.required]);
    } else {
      this.getUserByID(this.id).then((resp) => {
        if (resp.success) this.mapAccount(resp.details);
      });
    }
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
  
  userProfileChange(value: any, formControlName: string) {
    this.accountForm.controls[formControlName].setValue(value);
    this.accountForm.markAsDirty();
  }

  submit() {
    if (this.util.isEmptyID(this.id)) {
      this.saveUser();
    } else {
      this.updateUser();
    }
  }
  saveUser() {
    let request: UserSaveRequest = {
      user_type_id: this.userType,
      first_name: this.accountForm.controls['firstName'].value,
      last_name: this.accountForm.controls['lastName']?.value,
      profile_image:
        this.accountForm.controls['profileImage'].value?.id ?? null,
      email: this.accountForm.controls['email'].value,
      phone: this.accountForm.controls['phoneNo'].value,
      address: this.accountForm.controls['address'].value,
      password: this.accountForm.controls['password'].value,
    };

    lastValueFrom(this.http.POST(`users`, request)).then((resp) => {
      this.popup.showTost(resp.message);
    });
  }
  updateUser() {
    let param: Partial<User> = {
      first_name: this.accountForm.controls['firstName'].value,
      last_name: this.accountForm.controls['lastName']?.value,
      profile_image:
        this.accountForm.controls['profileImage'].value?.id ?? null,
      email: this.accountForm.controls['email'].value,
      phone: this.accountForm.controls['phoneNo'].value,
      address: this.accountForm.controls['address'].value,
    };

    lastValueFrom(
      this.http.PUT(`users/${this.accountForm.controls['id'].value}`, param)
    ).then((resp) => {
      this.popup.showTost(resp.message);
    });
  }
  getUserByID(id: string) {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('relationships', 'profileImage,userType');
    return lastValueFrom(this.http.GET(`users/${id}`, httpParams));
  }
}
