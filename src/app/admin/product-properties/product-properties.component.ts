import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, lastValueFrom, map, Observable, Subject, takeUntil } from 'rxjs';
import {
  Pagination,
  PaginationComponent,
} from 'src/app/core-components/pagination/pagination.component';
import { ControllerService } from 'src/app/services/controller.service';
import { BizStatus } from 'src/app/services/core';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-product-properties',
  templateUrl: './product-properties.component.html',
  styleUrls: ['./product-properties.component.scss'],
})
export class ProductPropertiesComponent implements OnInit,OnDestroy {
  headersFilter: FormControl = new FormControl('');
  headersPagination!: Pagination;
  headers: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();


  constructor(
    private http: ServerService,
    private pgService: ControllerService,
    public activatedRoute: ActivatedRoute,
    private popup:PopupService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    
    this.initListTab();
  }

  initListTab() {
    lastValueFrom(this.getOptionHeaders()).then((resp) =>
      this.importHeaderList(resp)
    );

    this.headersFilter.valueChanges
      .pipe(debounceTime(300))
      .subscribe((changes: string) => {
        lastValueFrom(
          this.getOptionHeaders([{ key: 'title', value: changes }])
        ).then((resp) => this.importHeaderList(resp));
      });
  }

  headerPageChange(url: any) {
    if (url) {
      lastValueFrom(this.http.fetch(url)).then((resp) =>
        this.importHeaderList(resp)
      );
    }
  }

  importHeaderList(resp: any) {
    if (resp.success) {
      this.headers = resp.details.data.map((v: any) => {
        v.created_at = this.pgService.dateFormat(v.created_at);
        v.updated_at = this.pgService.dateFormat(v.updated_at);
        return v;
      });
      this.headersPagination = PaginationComponent.convertPaginationObject(
        resp.details
      );
    }
  }

  async deleteItem(item:any) {
    lastValueFrom(this.deleteOption(item.id)).then(
      (response:any)=>{
        if(response.success) {
          this.popup.showTost("Success")
        }else {
          this.popup.showTost(response.message)
        }
      }
    )
  }
  
  /**
   * Http
   */
  getOptionHeaders(param?: { key: string; value: any }[]) {
    let hparam = new HttpParams();
    hparam = hparam.append('detail_count', true);
    param?.forEach((value) => {
      hparam = hparam.append(value.key, value.value);
    });
    return this.http.GET('options/headers', hparam);
  }

  deleteOption(id:string) {
    return this.http.DELETE(`options/headers/${id}`);
  }

}
