import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { BizStatus } from '../services/core';

@Directive({
  selector: '[lineThrough]',
})
export class LineThroughDirective implements OnInit, AfterViewInit, OnChanges {
  @HostBinding('class') private classList!: string;

  @Input('status') status: number = BizStatus.ACTIVE;

  constructor(private render: Renderer2, private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.perform();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.perform();
  }

  perform() {
    let classes: Array<string> = Array.from(
      this.elementRef.nativeElement.classList.values()
    );
    const lineThroughIndex = classes.indexOf('line-through');

    if (this.status == BizStatus.ACTIVE) {
      if (lineThroughIndex !== -1) {
        classes.splice(lineThroughIndex, 1);
      }
    } else {
      if (lineThroughIndex == -1) {
        classes.push('line-through');
      }
    }
    this.classList = classes.join(' ');
  }
}
