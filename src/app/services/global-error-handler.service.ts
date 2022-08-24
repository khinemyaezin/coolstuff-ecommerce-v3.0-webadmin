import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, Injector, NgZone } from '@angular/core';
import { PopupService } from './popup.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(private zone: NgZone,@Inject(Injector) private readonly injector: Injector ) {}
  get popup() {
    return this.injector.get(PopupService);

  }
  handleError(error: any) {
    // Check if it's an error from an HTTP response
    // if (!(error instanceof HttpErrorResponse)) {
    //   error = error.rejection; // get the error object
    // }
    // this.zone.run(() => {
    //   this.popup.alert("hello");
    // });

    // console.error('Error from global error handler', error);
  }
}
