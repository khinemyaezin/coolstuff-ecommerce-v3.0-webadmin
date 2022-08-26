import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'rr',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputDirective),
      multi: true,
    },
  ],
})
export class FileInputDirective implements ControlValueAccessor {
  public _onChange = (_: any) => {};

  constructor(private element: ElementRef, private render: Renderer2) {}

  @HostListener('change', ['$event.target.value']) _handleInput(event: any) {
    console.log(event);
    
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this._onChange(file);
    }
  }

  writeValue(value: any): void {
    const normalizedValue = value == null ? '' : value;
    this.render.setProperty(this.element.nativeElement, 'value', normalizedValue);
    console.log(value);
    
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }
}
