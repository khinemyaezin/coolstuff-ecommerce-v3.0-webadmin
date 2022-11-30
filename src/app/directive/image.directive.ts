import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: 'img',
})
export class ImageDirective {

  constructor(private elementRef: ElementRef,private render:Renderer2) {}


  @HostListener('error', ['$event']) onError(event: ErrorEvent) {
    this.render.setAttribute(this.elementRef.nativeElement,'src','assets/img/def-stock.jpg')
  }
}
