import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  easepick,
} from '@easepick/bundle';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ControllerService } from '../services/controller.service';

@Directive({
  selector: '[datePicker]',
})
export class DatePickerDirective implements OnInit, AfterViewInit, OnChanges {
  public datepicker!: any;
  @Input('start') public startDate: Date = new Date();
  @Input('end') public endDate: Date = new Date();

  constructor(private model: NgbModal,private elementRef:ElementRef,private render:Renderer2,private datepie:DatePipe) {}
  

  ngOnInit(): void {}
  ngAfterViewInit(): void {

    if(this.elementRef.nativeElement instanceof HTMLInputElement) {
      this.render.setAttribute( this.elementRef.nativeElement,'readonly', 'true');
      
      this.render.setAttribute( this.elementRef.nativeElement,'value', this.format(this.startDate, this.endDate))
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.render.setAttribute( this.elementRef.nativeElement,'value', this.format(this.startDate, this.endDate))
    
  }

  @HostListener('click', ['$event.target'])
  onClick(click: Event) {
    let output = new Subject<any>();
    let modelRef = this.model.open(NgbdModalContent, {
      backdrop: 'static',
      centered: true,
      modalDialogClass: 'transparent-modal',
    });
    modelRef.componentInstance.subject = output;
    modelRef.componentInstance.startDate = this.startDate;
    modelRef.componentInstance.endDate = this.endDate;

    output.subscribe({
      next: (e:{value:any,type:string}) => {
        modelRef.dismiss();
        if(e.type == 'apply') {          
          this.startDate = e.value.detail.start;
          this.endDate = e.value.detail.end;
          this.render.setAttribute( this.elementRef.nativeElement,'value', this.format(this.startDate, this.endDate))
        }
      },
    });
  }

  format(start:Date,end:Date) {
    const startDateString = this.datepie.transform(
      start,
      'dd-MM-YYYY'
    );
    const endDateString = this.datepie.transform(
      end,
      'dd-MM-YYYY'
    );
    const value = startDateString + ' -> ' + endDateString;
    return value;
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
export class NgbdModalContent implements AfterViewInit {
  @ViewChild('datepicker') public datePickerRef!: ElementRef;

  @Input() public subject: any;
  @Input() public startDate:Date = new Date();
  @Input() public endDate:Date = new Date();
  private easepick!: easepick.Core;

  constructor(public activeModal: NgbActiveModal,private service:ControllerService) {}
  ngAfterViewInit(): void {
    this.easepick = this.service.easePick(this.datePickerRef);

    this.easepick.on('select', (event: any) => {
      this.subject.next({ value: event, type: 'apply' });
    });
    this.easepick.on('click', (event) => {
    	const target = event.target;
      if (target instanceof HTMLElement &&  this.easepick.isCancelButton(target)) {
      	this.subject.next({ value: event, type: 'dismiss' });
      }
    });
    this.easepick.setStartDate( this.startDate );
    this.easepick.setEndDate( this.endDate );

  }
}

