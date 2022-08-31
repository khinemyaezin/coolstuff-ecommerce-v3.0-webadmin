import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { PaginationLink } from 'src/app/core-components/pagination/pagination.component';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
})
export class AttributesComponent implements OnInit {
  navTabList: any;
  navTabDetail: any;
  categoryList: any;
  category: any;
  variantOptionHeaders: any;
  catOptionFormGroup: FormGroup = new FormGroup({
    optionSearch: new FormControl(''),
  });
  paginationLinks: PaginationLink[] = [];

  constructor(private http: ServerService, private popup:PopupService) {}

  ngOnInit(): void {
    this.getDeparments(2);
  }
  showListTab() {
    this.navTabList.show();
  }

  showDetailTab(value: any) {
    this.category = value;
    this.getDepartmentAttributes(value.id);

    this.navTabDetail.show();
  }
  getDeparments(depth: number) {
    this.http.GET(`categories-withdepth/${depth}`).subscribe({
      next: (e: any) => {
        if (e.status == 200) {
          this.categoryList = e.details;
          this.paginationLinks = e.details.links;
        }
      },
      error: (e) => {},
    });
  }
  async pageChange(url: any) {
    if (url) {
      lastValueFrom(this.http.fetch(url)).then(
        (value:any)=>{
          if(value.status == 200 ) {

            this.categoryList = value.details;
            this.paginationLinks = value.details.links;

          }          
        }
      )

     
    }
  }
  getDepartmentAttributes(categoryId: string) {
    this.http.GET(`categories/${categoryId}/attributes/setup`).subscribe({
      next: (e: any) => {
        if (e.status == 200) {
          this.variantOptionHeaders = e.details.data;
        }
      },
      error: () => {},
    });
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
        
        if (e.status == 200) {
          this.popup.showTost(e.message);
        } else {
          alert(e.message);
        }
      });
  }
}
