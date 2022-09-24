import { Component, Input, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export interface confirmBoxConfig {
  btns?: {
    yes: {
      title: string;
      callback?: any;
    };
    no: {
      title: string;
      callback?: any;
    };
  };
}
export enum ConfirmBoxResult {
  CONFIRM,
  CANCEL
}

@Component({
  templateUrl: './confirmation-box.component.html',
  styleUrls: ['./confirmation-box.component.scss'],
})
export class ConfirmationBoxComponent implements OnInit {
  @Input() public modelRef!: NgbModalRef;
  @Input() public title: string = '';
  @Input() public body: string|null = null;
  @Input() public config!: confirmBoxConfig;

  constructor() {
    this.config = {
      btns: {
        yes: {
          title: 'OK',
        },
        no: {
          title: 'Cancel',
        },
      },
    };
  }

  ngOnInit(): void {}

  confirm() {
    this.modelRef.close(ConfirmBoxResult.CONFIRM);
  }
  cancel() {
    this.modelRef.close(ConfirmBoxResult.CANCEL);
  }
}
