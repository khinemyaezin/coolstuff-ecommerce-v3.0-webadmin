import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
import { Utility } from 'src/app/services/utility.service';
import { PopupService } from 'src/app/services/popup.service';
import {
  BrandBioUpdateRequest,
  BrandUpdateRequest,
} from 'src/app/services/requests';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-brand-setting',
  templateUrl: './brand-setting.component.html',
  styleUrls: ['./brand-setting.component.scss'],
})
export class BrandSettingComponent implements OnInit {
  @ViewChild('brandDetailInfo') public brandDetailInfoTabs!: any;

  mediaChooserConfigBrandCover: MediaChooserConfig = {
    pagination: 12,
    ratio: '5/1',
  };
  mediaChooserConfigBrandLogo: MediaChooserConfig = {
    pagination: 12,
    ratio: '1/1',
  };

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
  brandBio: FormGroup = new FormGroup({
    bio: new FormControl(''),
  });
  constructor(
    private auth: AuthService,
    private pgservice: Utility,
    public popup: PopupService,
    private http: ServerService
  ) {}

  ngOnInit(): void {
    this.getBrandByID(this.auth.user.brand.id);
  }

  mapBrand(brand: any) {
    this.brandForm.get('id')?.setValue(brand.id, { emitEvent: false });
    this.brandForm
      .get('publicId')
      ?.setValue(brand.public_id, { emitEvent: false });
    this.brandForm.get('title')?.setValue(brand.title, { emitEvent: false });
    this.brandForm
      .get('createdAt')
      ?.setValue(this.pgservice.dateFormat(brand.created_at), {
        emitEvent: false,
      });
    this.brandForm
      .get('updatedAt')
      ?.setValue(brand.updated_at, { emitEvent: false });
    this.brandForm
      .get('profileImage')
      ?.setValue(brand.profile_image, { emitEvent: false });
    this.brandForm
      .get('coverImage')
      ?.setValue(brand.cover_image, { emitEvent: false });

    this.brandBio.get('bio')?.setValue(brand.description, { emitEvent: false });    
  }
  cancelBrand() {
    this.brandForm.get('formStateEdit')?.setValue(false);
    this.brandDetailInfoTabs.select(1);
  }
  brandLogoChange(value: any, formControlName: string) {
    this.brandForm.controls[formControlName].setValue(value);
  }
  submitBrand() {
    const param: BrandUpdateRequest = {
      title: this.brandForm.get('title')?.value,
      profile_image: this.brandForm.get('profileImage')?.value?.id,
      cover_image: this.brandForm.get('coverImage')?.value?.id,
    };
    console.log(param);

    this.http.PUT(`brands/${this.auth.user.brand.id}`, param).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.popup.showTost('Success!');
        } else {
          this.popup.showTost(resp.message);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
    this.brandForm.get('formStateEdit')?.setValue(false);
    this.brandDetailInfoTabs.select(1);
  }
  getBrandByID(id: string) {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('relationships', 'profileImage,coverImage');
    lastValueFrom(this.http.GET(`brands/${id}`,httpParams)).then((resp) => {
      if (resp.success) {
        this.mapBrand(resp.details);
      }
    });
  }
  submitBrandBio(e: any) {
    const request: BrandBioUpdateRequest = {
      description: this.brandBio.get('bio')?.value,
    };
    lastValueFrom(
      this.http.PUT(
        `brands/${this.brandForm.get('id')?.value}/description`,
        request
      )
    ).then((resp) => {
      this.popup.showTost(resp.message);
    });
  }
}
