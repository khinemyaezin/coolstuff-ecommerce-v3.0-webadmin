import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { NgControl } from '@angular/forms';

enum ValidationType {
  NUMBER = 'number',
  TEXT = 'text'
} 

@Directive({
  selector: '[]',
})
export class ValidationDirective implements OnInit, AfterViewInit, OnChanges {
  protected _elementClass: string[] = [];
  @HostBinding('class')
  get elementClass(): string {
    return this._elementClass.join(' ');
  }
  set(val: string) {
    this._elementClass = val.split(' ');
  }

  @Input('vType') public type:string = ValidationType.NUMBER;

  constructor(
    private elementRef: ElementRef,
    private render: Renderer2,
    private control: NgControl
  ) {
    this._elementClass = Array.from(
      this.elementRef.nativeElement.classList.values()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.perform();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
  }

  perform() {
    let classes: Array<string> = Array.from(
      this.elementRef.nativeElement.classList.values()
    );
    const invalidIndex = classes.indexOf('is-invalid');
    if (!this.control.valid && this.control.touched) {
      console.log('invalid');
      
      if (invalidIndex == -1) {
        classes.push('is-invalid');
      }
    } else {
      if (invalidIndex !== -1) {
        classes.splice(invalidIndex, 1);
      }
    }
    this._elementClass = classes;

    if(this.type == ValidationType.NUMBER) {
      
    }
  }

  @HostListener('ngModelChange', ['$event'])
  public onModelChange(value: any): void {    
    console.log(`ngModelChange[value=${value}] [touch=${this.control.touched}] [valid=${this.control.valid}]` );
    
    this.perform();
  }

  @HostListener('change', ['$event'])
  public onChanges(value: any): void {
    this.perform();
  }
}
