import { Component, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
export interface PaginationLink {
  url: null|string,
  label: string,
  active: boolean
}
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input('links') links: PaginationLink[] = [];
  @Output('pageChange') change = new Subject<any>();

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {}

  fetch(url: any) {
    this.change.next(url);
  }
}
