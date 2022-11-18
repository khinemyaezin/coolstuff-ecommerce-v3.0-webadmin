import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { InvalidRouteError } from './invalid-route-error';
import { ModelNotFoundError } from '../http-errors/model-notfound-error';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler{

  constructor(public router:Router) { }

  handleError(error: any): void {
    if(error instanceof ModelNotFoundError || error instanceof InvalidRouteError) {
      this.router.navigateByUrl('/404')
    }
  }
}
