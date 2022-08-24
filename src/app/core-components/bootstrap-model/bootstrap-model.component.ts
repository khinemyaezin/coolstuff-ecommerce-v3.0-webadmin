import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { easepick, RangePlugin } from '@easepick/bundle';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-bootstrap-model',
  templateUrl: './bootstrap-model.component.html',
  styleUrls: ['./bootstrap-model.component.scss'],
})
export class BootstrapModelComponent implements OnInit {
  @ViewChild('content') public model!: any;
  @ViewChild('picker') public picker!: ElementRef;
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
   
    this.openModel();
    
  }
  async openModel() {
    const model = this.modalService
    .open(this.model, { ariaLabelledBy: 'modal-basic-title' });
    console.log('picker instance', this.picker);
    
    let datepicker = new easepick.create({
      element: this.picker.nativeElement,
      css: [
        'https://cdn.jsdelivr.net/npm/@easepick/core@1.2.0/dist/index.css',
        'https://cdn.jsdelivr.net/npm/@easepick/range-plugin@1.2.0/dist/index.css',
      ],
      format: 'DD-MM-YYYY',
      plugins: [RangePlugin],
      inline: true,
      zIndex: 1000,
      RangePlugin: {
        tooltip: true,
        delimiter: ' -> ',
      },
    });
  }
}
