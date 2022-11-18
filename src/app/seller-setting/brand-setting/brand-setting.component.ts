import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaChooserConfig } from 'src/app/core-components/media-chooser/media-chooser.component';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
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
  constructor(
    private auth: AuthService,
    private pgservice: ControllerService,
    public popup: PopupService,
    private http: ServerService
  ) {}

  ngOnInit(): void {
    this.mapBrand(this.auth.user.brand);
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
  brandLogoChange(value: any, formControlName: string) {
    this.brandForm.controls[formControlName].setValue(value);
  }
  submitBrand() {
    const param = {
      title: this.brandForm.get('title')?.value,
      profile_image: this.brandForm.get('profileImage')?.value?.id,
      cover_image: this.brandForm.get('coverImage')?.value?.id,
    };
    this.http.PUT(`brands/${this.auth.user.brand.id}`, param).subscribe({
      next:(resp)=>{
        if(resp.success){
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
}
