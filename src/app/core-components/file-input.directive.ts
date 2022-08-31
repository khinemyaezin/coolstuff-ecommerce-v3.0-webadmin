import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[input[type=file]]',
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

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    this._onChange(
      Object.keys(event).map(function (key: any, index) {
        return event[key];
      })
    );
  }

  writeValue(value: any): void {
    if(!value)
    this.render.setProperty(this.element.nativeElement, 'value', '');
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {}
}
