import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent implements OnInit {


  @Output()
    closed = new EventEmitter();
  @Output()
    ready = new EventEmitter();
  modal: any;
  myConfirm = false;
  header = '';
  cancelBtn = 'No';
  confirmBtn = 'Yes';
  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    // this.modal = new bootstrap.Modal(document.getElementById('confirm-modal'), { backdrop: 'static'});
    // this.modal.show();
    // const modal = document.getElementById('confirm-modal') as any;
    // modal.addEventListener('hidden.bs.modal', () => {
    //   this.closed.emit(this.myConfirm);
    // });
    // this.ready.emit();
  }

  confirm(){
    this.myConfirm = true;
    this.modal.hide();
  }
  cancel(){
    this.myConfirm = false;
    this.modal.hide();
  }



}
