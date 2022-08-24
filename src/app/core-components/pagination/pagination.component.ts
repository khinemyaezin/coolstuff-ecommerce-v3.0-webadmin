import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
  @Input('urlFetch') urlFetch: any;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {}

  fetch(url: string) {
    this.urlFetch(url);
  }
}
