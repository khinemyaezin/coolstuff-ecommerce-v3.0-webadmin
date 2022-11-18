import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Observable, Subject, takeUntil } from 'rxjs';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
import { User } from 'src/app/services/core';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  accountForm: FormGroup = new FormGroup({
    id: new FormControl('-1'),
    mdate: new FormControl(''),
    cdate: new FormControl(''),
    firstName: new FormControl('', { validators: [Validators.required] }),
    lastName: new FormControl('', { validators: [Validators.required] }),
    email: new FormControl(),
    phoneNo: new FormControl('', { validators: [Validators.required] }),
    address: new FormControl('', { validators: Validators.required }),
    profileImage: new FormControl(),
    formStateEdit: new FormControl(false),
  });
  authenForm: FormGroup = new FormGroup({
    current_password: new FormControl(''),
    newPassword: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });

  mediaChooserConfigUserProfile: MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1',
  };
  destroy$: Subject<boolean> = new Subject<boolean>();

  get matchPassword(): boolean {
    return (
      this.authenForm.get('newPassword')?.value ==
      this.authenForm.get('confirmPassword')?.value
    );
  }
  constructor(
    public popup: PopupService,
    private http: ServerService,
    public activatedRoute: ActivatedRoute,
    private router:Router
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  ngOnInit(): void {
    const param: Observable<any> = this.activatedRoute.params;
    param.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      this.getUserByID(param.id).then((resp) => {
        if (resp.success) this.mapAccount(resp.details);
        else {
          this.popup.showTost(resp.message);
          this.router.navigate(['seller-central/settings/users&permissions']);
        }
      });
    });
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

  getUserByID(id: string) {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('relationships', 'profileImage,userType');
    return lastValueFrom(this.http.GET(`users/${id}`, httpParams));
  }
  saveAccount() {
    let param: Partial<User> = {
      first_name: this.accountForm.controls['firstName'].value,
      last_name: this.accountForm.controls['lastName']?.value,
      profile_image:
        this.accountForm.controls['profileImage'].value?.id ?? null,
      email: this.accountForm.controls['email'].value,
      phone: this.accountForm.controls['phoneNo'].value,
      address: this.accountForm.controls['address'].value,
    };

    this.http
      .PUT(`users/${this.accountForm.controls['id'].value}`, param)
      .subscribe({
        next: (resp) => {
          if (resp.status == 200) {
            this.popup.showTost('Success!');
          } else {
            this.popup.showTost(resp.message);
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  UserProfileChange(value: any, formControlName: string) {
    this.accountForm.controls[formControlName].setValue(value);
    this.accountForm.markAsDirty();
  }
  submitChangePassword( event:string ) {
    const param = {
      password: event,
    };
    this.http.PUT('sessions/user/password', param).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.popup.showTost('Success');
        } else {
          this.popup.showTost(resp.message);
        }
      },
      error: (e) => {
        this.popup.showTost(e);
        console.log(e);
      },
    });
  }
}
