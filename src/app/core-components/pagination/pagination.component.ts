import { Component, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

export interface Pagination {
  from:number,
  to:number,
  currentPage: number;
  total: number;
  perPage: number;
  links: PaginationLink[];
}

export interface PaginationLink {
  url: null | string;
  label: string;
  active: boolean;
}
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input('source') pagination!: Pagination;
  @Output('pageChange') change = new Subject<any>();

  get offset() {
    return (this.pagination.currentPage - 1) * this.pagination.perPage + 1;
  }
  get paginationLink() {
    return this.pagination ? this.pagination.links : [];
  }
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {}

  fetch(url: any) {
    this.change.next(url);
  }

  static convertPaginationObject(respPagination:any):Pagination{
    return {
      from: respPagination.from,
      to:respPagination.to,
      currentPage: respPagination.current_page,
      perPage: respPagination.per_page,
      total: respPagination.total,
      links:respPagination.links
    }
  }
}
