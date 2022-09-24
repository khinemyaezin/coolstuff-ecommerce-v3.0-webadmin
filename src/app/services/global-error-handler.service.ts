import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModelNotFoundError } from './model-notfound-error';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler{

  constructor(public router:Router) { }

  handleError(error: any): void {
    if(error instanceof ModelNotFoundError) {
      this.router.navigateByUrl('/404')
    }
  }
}
