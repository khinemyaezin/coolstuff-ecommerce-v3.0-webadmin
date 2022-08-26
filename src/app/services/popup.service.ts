import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
  TemplateRef,
} from '@angular/core';
import { DialogConfirmComponent } from '../core-components/dialog-confirm/dialog-confirm.component';
import { ImageCropperModelComponent } from '../core-components/image-cropper-model/image-cropper-model.component';
import { LoadingComponent } from '../core-components/loading/loading.component';

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
    private injector: Injector
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
  showConfirmModal(m: {
    header: string;
    btns?: { cancel: string; confirm: string };
  }) {
    return new Promise<boolean>((rs, rj) => {
      const popup = document.createElement('modal-component');
      const factory = this.componentFactoryResolver.resolveComponentFactory(
        DialogConfirmComponent
      );
      const popupComponentRef = factory.create(this.injector, [], popup);
      this.appRef.attachView(popupComponentRef.hostView);
      popupComponentRef.instance.header = m.header;
      if (m.btns) {
        popupComponentRef.instance.cancelBtn = m.btns.cancel;
        popupComponentRef.instance.confirmBtn = m.btns.confirm;
      }
      popupComponentRef.instance.closed.subscribe((e) => {
        $(popup).remove();
        this.appRef.detachView(popupComponentRef.hostView);
        rs(e);
      });
      popupComponentRef.instance.ready.subscribe(() => {});
      const notifierContainerRef = document.body.getElementsByClassName(
        'confirm-identity-modal'
      );
      $(notifierContainerRef).append(popup);
    });
  }
  showImageCropperModal(
    base64: string,
    ratio: number,
    m?: { header: string; btns?: { cancel: string; confirm: string } }
  ) {
    return new Promise<string>((rs, rj) => {
      const popup = document.createElement('modal-component');
      const factory = this.componentFactoryResolver.resolveComponentFactory(
        ImageCropperModelComponent
      );
      const popupComponentRef = factory.create(this.injector, [], popup);
      this.appRef.attachView(popupComponentRef.hostView);
      popupComponentRef.instance.base64 = base64;
      popupComponentRef.instance.ratio = ratio;
      // if(m.btns){
      //   popupComponentRef.instance.cancelBtn = m.btns.cancel;
      //   popupComponentRef.instance.confirmBtn = m.btns.confirm;
      // }
      popupComponentRef.instance.closed.subscribe((e: string) => {
        $(popup).remove();
        this.appRef.detachView(popupComponentRef.hostView);
        e == null ? rj() : rs(e);
      });
      popupComponentRef.instance.ready.subscribe(() => {});
      const notifierContainerRef = document.body.getElementsByClassName(
        'confirm-identity-modal'
      );
      $(notifierContainerRef).append(popup);
    });
  }

  showTost(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  removeTost(toast:any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clearTost() {
    this.toasts.splice(0, this.toasts.length);
  }
}
