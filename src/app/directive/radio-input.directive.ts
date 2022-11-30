import {
  Directive,
  forwardRef,
  HostListener,
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
  constructor() {}

  public _onChange = (_: any) => {};

  @HostListener('change', ['$event.target']) onChange(e: any): void {
    
  }

  writeValue(value: any): void {
    this._onChange(value);
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {}
}
