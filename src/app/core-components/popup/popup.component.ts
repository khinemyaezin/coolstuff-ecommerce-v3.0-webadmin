import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  @Input()
  get message(): string {
    return this._message;
  }
  set message(message: string) {
    this._message = message;
  }

  private _message = '';

  @Output()
  closed = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}
}
