import { HttpParams } from '@angular/common/http';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
  TemplateRef,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { ConfirmationBoxComponent, ConfirmBoxResult } from '../core-components/confirmation-box/confirmation-box.component';
import { ImageCropperModelComponent } from '../core-components/image-cropper-model/image-cropper-model.component';
import { LoadingComponent } from '../core-components/loading/loading.component';
import { Media, MediaChooserModelComponent } from '../core-components/media-chooser-model/media-chooser-model.component';
import { ImageCropperConfig, MediaChooserConfig } from '../core-components/media-chooser/media-chooser.component';
import { ViewResult } from './core';
import { ServerService } from './server.service';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  loadingEl: any;
  toasts: any[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private ngModel: NgbModal,
    private http: ServerService
  ) {}

  showLoading(message: string) {
    return new Promise<{ present: any; dismiss: any }>((resolve, reject) => {
      const popup = document.createElement('loading-component');
      popup.style.zIndex = '2000 !important';
      const factory =
        this.componentFactoryResolver.resolveComponentFactory(LoadingComponent);
      this.loadingEl = factory.create(this.injector, [], popup);
      this.appRef.attachView(this.loadingEl.hostView);
      this.loadingEl.instance.message = message;
      resolve({
        present: () => {
          document.body.appendChild(popup);
        },
        dismiss: () => {
          document.body.removeChild(popup);
        },
      });
    });
  }

  showImageCropperModal(config:ImageCropperConfig) {
    const model:NgbModalRef = this.ngModel.open(ImageCropperModelComponent, {
      backdrop: 'static',
      centered: true,
      scrollable: true,
      size: 'lg',
    });
    model.componentInstance.config = config;
    model.componentInstance.modelRef = model;
    return model.result;
  }

  showTost(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  showSuccessToast(textOrTpl: string ) {
    const options = {classname: 'toast toast-success'};
    this.toasts.push(
      { 
        textOrTpl, 
        ...options
    });
  }

  removeTost(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clearTost() {
    this.toasts.splice(0, this.toasts.length);
  }

  async showMediaChooser(config:MediaChooserConfig):Promise<Media|null> {
    let param = new HttpParams();
    for (const [key, value] of Object.entries(config)) {
      param = param.append(key, value);
    }
    const files = await this.getMedias(param);
    const model = this.ngModel.open(MediaChooserModelComponent, {
      backdrop: 'static',
      centered: true,
      scrollable: true,
      size: 'lg',
    });
    model.componentInstance.files = files;
    model.componentInstance.modelRef = model;
    model.componentInstance.httpParam = param;
    model.componentInstance.config = config;
    return model.result;
    
  }

  getMedias(param:HttpParams) {
 
    return lastValueFrom(this.http.GET('files', param)).then(
      (value: ViewResult<any> | any) => {
        if (value.success) {
          return value.details;
        } else {
          return null;
        }
      },
      (error) => {
        console.log(error);
        return null;
      }
    );
  }

  confirmBox(title:string,message:string|null = null):Promise<ConfirmBoxResult>{
    const model:NgbModalRef = this.ngModel.open(ConfirmationBoxComponent, {
      backdrop: 'static',
      centered: true,
      scrollable: true,
      size: 'sm',
    });
    model.componentInstance.modelRef = model;
    model.componentInstance.title = title;
    model.componentInstance.body = message;
    return model.result as Promise<ConfirmBoxResult>;
  }
}
