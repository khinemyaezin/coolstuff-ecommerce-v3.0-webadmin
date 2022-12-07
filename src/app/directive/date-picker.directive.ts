import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { easepick } from '@easepick/bundle';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Utility } from '../services/utility.service';
export interface DatePickerValue {
  start: Date,
  end:Date
}
@Directive({
  selector: '[datePicker]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerDirective),
      multi: true,
    },
  ],
})
export class DatePickerDirective
  implements OnInit, ControlValueAccessor, AfterViewInit
{
  @HostBinding('value') inputRef: string = '';
  public datepicker!: any;

  private output = new Subject<any>();
  private modelRef: any;
  private dateValue:DatePickerValue = { start: new Date(), end:new Date()};

  constructor(
    private model: NgbModal,
    private elementRef: ElementRef,
    private render: Renderer2,
    private datepie: DatePipe
  ) {}

  public _onChange = (_: any) => {};

  writeValue(e: any): void {
    if (e) {
      this.inputRef = this.format(e.start, e.end);
      this.dateValue = e;
    } else {
      this._onChange(this.dateValue)
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {}

  ngOnInit(): void {
    
    // Fire after datepicker model dismiss
    this.output.subscribe({
      next: (e: { value: any; type: string }) => {
        this.modelRef.dismiss();
        if (e.type == 'apply') {
          this.dateValue = e.value.detail;
          // Render set value to input
          this.inputRef = this.format(e.value.detail.start, e.value.detail.end);

          this._onChange(this.dateValue);
        }
      },
    });

    this.inputRef = this.format( this.dateValue.start, this.dateValue.end);
    this._onChange(this.dateValue);
  }

  ngAfterViewInit(): void {
    if (this.elementRef.nativeElement instanceof HTMLInputElement) {
      this.render.setAttribute(
        this.elementRef.nativeElement,
        'readonly',
        'true'
      );
    }
  }

  @HostListener('click', ['$event.target'])
  onClick(click: Event) {
    this.showDatepickerModel();
  }

  @HostListener('keydown', ['$event.target'])
  onFocus(click: Event) {
    this.showDatepickerModel();
  }

  @HostListener('ngModelChange', ['$event'])
  public onModelChange(e: any): void {}

  format(start: Date, end: Date) {
    const startDateString = this.datepie.transform(start, 'dd-MM-YYYY');
    const endDateString = this.datepie.transform(end, 'dd-MM-YYYY');
    const value = startDateString + ' / ' + endDateString;
    return value;
  }

  showDatepickerModel() {
    this.modelRef = this.model.open(NgbdModalContent, {
      backdrop: 'static',
      centered: true,
      modalDialogClass: 'transparent-modal',
    });

    this.modelRef.componentInstance.subject = this.output;
    this.modelRef.componentInstance.startDate = this.dateValue.start;
    this.modelRef.componentInstance.endDate = this.dateValue.end;
  }
}

@Component({
  selector: 'modal-content',
  template: `
    <div class="d-flex justify-content-center">
      <input type="text" #datepicker hidden />
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .transparent-modal .modal-content {
        background-color: transparent;
        border: none;
      }
    `,
  ],
})
export class NgbdModalContent implements AfterViewInit,OnInit {
  @ViewChild('datepicker') public datePickerRef!: ElementRef;

  @Input() public subject: any;
  @Input() public startDate: Date = new Date();
  @Input() public endDate: Date = new Date();
  private easepick!: easepick.Core;

  constructor(
    public activeModal: NgbActiveModal,
    private service: Utility
  ) {}
  
  ngAfterViewInit(){
   this.easepick = this.service.easePick(this.datePickerRef);

    this.easepick.on('select', (event: any) => {
      this.subject.next({ value: event, type: 'apply' });
    });
    this.easepick.on('click', (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        this.easepick.isCancelButton(target)
      ) {
        this.subject.next({ value: event, type: 'dismiss' });
      }
    });
    if( this.startDate ) this.easepick.setStartDate(this.startDate);
    if( this.endDate ) this.easepick.setEndDate(this.endDate);
  }
  ngOnInit(): void {
 
  }
}
