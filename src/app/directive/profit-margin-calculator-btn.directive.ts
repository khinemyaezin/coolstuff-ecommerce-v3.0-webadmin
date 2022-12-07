import { Directive, HostBinding, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfitMarginCalculatorComponent } from '../core-components/profit-margin-calculator/profit-margin-calculator.component';

@Directive({
  selector: '[profitMarginCalculatorBtn]'
})
export class ProfitMarginCalculatorBtnDirective {
  @Input('costOfItem') costOfItem:number = 0;
  constructor(private modalService: NgbModal) { }

  @HostListener('click', ['$event.target'])
  onClick(click: Event) {
    
    const modal = this.modalService.open(ProfitMarginCalculatorComponent,{
      centered:true,

    });
    modal.componentInstance.type = "model";
    modal.componentInstance.costOfItem = this.costOfItem;
  }
}
