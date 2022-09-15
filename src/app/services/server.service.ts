import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, forkJoin, lastValueFrom, catchError } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CONFIG } from './core';

interface HttpOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
  observe?: string;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType: string;
  withCredentials?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private _CONFIG!: CONFIG;
  private _SYSTEM: any;
  private sessionURL = 'sessions/user';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  get config() {
    return this._CONFIG;
  }

  init() {
    return new Promise<void>((res, rej) => {
      const config = this.http.get('/assets/config/config.json');
      const system = this.http.get('/assets/config/system.json');
      //console.log(config);

      lastValueFrom(forkJoin([config, system]))
        .catch((error) => {})
        .then((next: any) => {
          this._CONFIG = next[0] as CONFIG;
          this._SYSTEM = next[1];

          this.GET(this.sessionURL).subscribe({
            next: (body: any) => {
              this.auth.signin(body.details,false);
              res();
            },
            error: (err) => {
              console.log(err);
              res();
            },
          });
        });

      // Success configuration;
    });
  }

  GET(
    url: string,
    params?:
      | HttpParams
      | {
          observe: CsHttpObserveType;
          httpParam?: HttpParams;
        }
  ) {
    const myurl = this._CONFIG?.url + url;
    const options = this.options(params);
    //console.log(options);

    return this.http.get(myurl, options as any).pipe(
      map((resp: any) => {
        if (options.observe == CsHttpObserveType.event) {
          return resp as HttpEvent<any>;
        } else {
          return resp.body;
        }
      }),
      catchError((err: HttpErrorResponse) => {
        // console.log(window.location.href);
        
        // if (err.status == HttpStatusCode.Unauthorized && myurl !== this.sessionURL) {
        //   this.router.navigate(['/signin']);
        // }
        throw `error in source. Details:${err.statusText} `;
      })
    );
  }

  POST(
    url: string,
    body: any,
    params?:
      | HttpParams
      | {
          observe: CsHttpObserveType;
          httpParam?: HttpParams;
        }
  ): Observable<any> {
    const myurl = this._CONFIG?.url + url;
    const options: HttpOptions = this.options(params);

    return this.http.post(myurl, body, options as any).pipe(
      map((resp: any) => {
        if (options.observe == CsHttpObserveType.event) {
          return resp as HttpEvent<any>;
        } else {
          return resp.body;
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status == HttpStatusCode.Unauthorized) {
          this.router.navigate(['/signin']);
        }
        throw `error in source. Details:${err.statusText} `;
      })
    );
  }

  PUT(
    url: string,
    body: any,
    params?:
      | HttpParams
      | {
          observe: CsHttpObserveType;
          httpParam?: HttpParams;
        }
  ) {
    const myurl = this._CONFIG?.url + url;
    const options: HttpOptions = this.options(params);
    return this.http.put(myurl, body, options as any).pipe(
      map((resp: any) => {
        if (options.observe == CsHttpObserveType.event) {
          return resp as HttpEvent<any>;
        } else {
          return resp.body;
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status == HttpStatusCode.Unauthorized) {
          this.router.navigate(['/signin']);
        }
        throw `error in source. Details:${err.statusText} `;
      })
    );
  }

  fetch(url: string): Observable<any> {
    const myurl = url;
    const options: {
      headers?: HttpHeaders;
      params?: HttpParams;
    } = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    };
    return this.http
      .get(myurl, {
        ...options,
        withCredentials: true,
        observe: 'response',
      })
      .pipe(
        map((resp) => {
          return resp.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.status == HttpStatusCode.Unauthorized) {
            this.router.navigate(['/signin']);
          }
          throw `error in source. Details:${err.statusText} `;
        })
      );
  }

  private options(
    params?:
      | HttpParams
      | {
          observe: CsHttpObserveType;
          httpParam?: HttpParams;
        }
  ): HttpOptions {
    let options: HttpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
      observe: CsHttpObserveType.response,
      withCredentials: true,
      reportProgress: false,
      responseType: 'json',
    };
    if (params && params instanceof HttpParams) {
      options.params = params;
      (options.headers as HttpHeaders)?.append(
        'Content-Type',
        'application/json'
      );
    } else if (params && !(params instanceof HttpParams)) {
      if (params.httpParam) {
        options.params = params.httpParam;
      }
      if (params.observe == CsHttpObserveType.event) {
        options.observe = CsHttpObserveType.event;
        options.reportProgress = true;
      }
    }
    return options;
  }

  logout() {
    return this.GET('logout')
  }

}

export enum CsHttpObserveType {
  event = 'events',
  response = 'response',
}
