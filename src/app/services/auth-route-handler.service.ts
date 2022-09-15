import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {
  Injectable,
} from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthRouteHandlerService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(req)
      .pipe(catchError((x) => this.handleAuthError(x))); 
  }
  private handleAuthError(err: HttpErrorResponse): Observable<any> {    
    if (err.status === 404 || err.status === 405) {
      this.router.navigateByUrl('/404');
      return of(err.message); // or EMPTY may be appropriate here
    }
    return throwError(() => err);
  }
}
