import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[csRadio]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioInputDirective),
      multi: true,
    },
  ],
})
export class RadioInputDirective implements ControlValueAccessor {
  constructor(private element: ElementRef, private render: Renderer2) {}

  public _onChange = (_: any) => {};

  @HostListener('change', ['$event.target']) onChange(e: any): void {
    //console.log('change', this.ngControl.value);
    
  }

  writeValue(value: any): void {
    console.log(`native id ${this.element.nativeElement.id} / myid ${value?.id}`);
    this._onChange(value);
    // if(value && value.id == this.element.nativeElement.id) {
    //   this.render.setProperty(this.element.nativeElement, 'checked', 'true');
    // }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {}
}
