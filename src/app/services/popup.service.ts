import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
} from '@angular/core';
import { BootstrapModelComponent } from '../core-components/bootstrap-model/bootstrap-model.component';
import { DialogConfirmComponent } from '../core-components/dialog-confirm/dialog-confirm.component';
import { ImageCropperModelComponent } from '../core-components/image-cropper-model/image-cropper-model.component';
import { LoadingComponent } from '../core-components/loading/loading.component';
import { PopupComponent } from '../core-components/popup/popup.component';
import { Auth } from './core';
declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  loadingEl: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  // showConfirmIdenModal() {
  //   return new Promise<Auth>((rs, rj) => {
  //     const popup = document.createElement('modal-component');
  //     const factory = this.componentFactoryResolver.resolveComponentFactory(
  //       BootstrapModelComponent
  //     );
  //     const popupComponentRef = factory.create(this.injector, [], popup);
  //     this.appRef.attachView(popupComponentRef.hostView);
  //     popupComponentRef.instance.closed.subscribe((e) => {
  //       $(popup).remove();
  //       this.appRef.detachView(popupComponentRef.hostView);
  //       if (e.confirm) {
  //         const auth: Auth = {
  //           id: '',
  //           currentPassword: e.password,
  //           newPassword: '',
  //         };
  //         rs(auth);
  //       } else {
  //         rj();
  //       }
  //     });
  //     popupComponentRef.instance.ready.subscribe(() => {});
  //     const notifierContainerRef = document.body.getElementsByClassName(
  //       'confirm-identity-modal'
  //     );
  //     $(notifierContainerRef).append(popup);
  //   });
  // }
  alert(message: string) {
    return new Promise<void>((rs, rj) => {
      // Create element
      const popup = document.createElement('popup-component');
      // Create the component and wire it up with the element
      const factory =
        this.componentFactoryResolver.resolveComponentFactory(PopupComponent);
      const popupComponentRef = factory.create(this.injector, [], popup);
      // Attach to the view so that the change detector knows to run
      this.appRef.attachView(popupComponentRef.hostView);
      // Listen to the close event
      popupComponentRef.instance.closed.subscribe(() => {
        $(popup).remove();
        this.appRef.detachView(popupComponentRef.hostView);
      });

      // Set the message
      popupComponentRef.instance.message = message;
      // Add to the DOM
      const notifierContainerRef =
        document.body.getElementsByClassName('notifier');
      $(notifierContainerRef).append(popup);
      const myApp = document.body.getElementsByClassName('my-app');
      $(myApp).addClass('disabled');
      setTimeout(() => {
        $(popup).remove();
        this.appRef.detachView(popupComponentRef.hostView);
        $(myApp).removeClass('disabled');
        rs();
      }, 1000);
    });
  }
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
}
