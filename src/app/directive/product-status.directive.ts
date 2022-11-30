import { AfterViewInit, Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[prodStatus]',
})
export class ProductStatusDirective implements AfterViewInit {
  @HostBinding('innerHTML') text = '';
  @HostBinding('class') class = '';
  @Input('value') value: string = '';

  constructor() {}

  ngAfterViewInit(): void {
    this.text = this.value;
    switch (this.value) {
      case 'active':
        this.class = 'badge-soft-active';
        break;
      case 'pending':
        this.class = 'badge-soft-pending';
        break;
      case 'disabled':
        this.class = 'badge-soft-hold';
        break;
      case 'waiting':
        this.class = 'badge-soft-freeze';
        break;
      case 'expired':
        this.class = 'badge-soft-outofstock';
        break;
      case 'outofstock':
        this.class = 'badge-soft-outofstock';
        break;
      default :this.class = '';
    }
  }
}
