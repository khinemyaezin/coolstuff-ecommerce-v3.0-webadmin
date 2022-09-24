import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { debounceTime, lastValueFrom, Subject, takeUntil } from 'rxjs';
import {
  Pagination,
  PaginationComponent,
  PaginationLink,
} from 'src/app/core-components/pagination/pagination.component';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
})
export class AttributesComponent implements OnInit,OnDestroy {
  @ViewChild('nav') public tabs!: any;

  categoryList: any;
  category: any;
  variantOptionHeaders: any;
  optionSearch = new FormControl('');

  pagination!: Pagination;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: ServerService, private popup: PopupService,private pgService:ControllerService) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.getDeparments(2);
    this.optionSearch.valueChanges.pipe(takeUntil(this.destroy$),debounceTime(300)).subscribe(
      (changes:any)=>{
        if(this.pgService.isEmptyOrSpaces(changes)) {
          this.getDeparments(2);
        }else {
          this.getDeparments(2,(changes as string).trim());
        }
      }
    )
  }

  async showDetailTab(value: any) {
    this.category = value;
    await this.getDepartmentAttributes(value.id).then((resp: any) => {
      if (resp.success) {
        this.variantOptionHeaders = resp.details.data;
      }
    });
    this.tabs.select(2);
  }

  getDeparments(depth: number, search?: string) {
    let param = new HttpParams();
    if (search) param = param.append('title', search);
    this.http.GET(`categories-withdepth/${depth}`, param).subscribe({
      next: (e: any) => {
        if (e.success) {
          this.categoryList = e.details;
          this.pagination = PaginationComponent.convertPaginationObject(
            e.details
          );
        }
      },
      error: (e) => {},
    });
  }

  async pageChange(url: any) {
    if (url) {
      lastValueFrom(this.http.fetch(url)).then((value: any) => {
        if (value.success) {
          this.categoryList = value.details;
          this.pagination = PaginationComponent.convertPaginationObject(
            value.details
          );
        }
      });
    }
  }

  getDepartmentAttributes(categoryId: string) {
    return lastValueFrom(
      this.http.GET(`categories/${categoryId}/attributes/setup`)
    );
  }

  save() {
    const param: any = {
      variant_option_hdr_ids: this.variantOptionHeaders
        .filter((optionHeader: any) => {
          return optionHeader.checked;
        })
        .map((checkedHeader: any) => {
          return checkedHeader.id.toString();
        }),
    };
    this.http
      .PUT(`categories/${this.category.id}/attributes`, param)
      .subscribe((e: any) => {
        console.log(param);

        if (e.success) {
          this.popup.showTost(e.message);
        } else {
          alert(e.message);
        }
      });
  }
}
