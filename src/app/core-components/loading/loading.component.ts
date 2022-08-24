import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @Input()
  get message(): string {
    return this._message;
  }
  set message(message: string) {
    this._message = message;
  }

  @Output()
  closed = new EventEmitter();
  private _message = '';
  
  constructor() {}

  ngOnInit(): void {}
}
