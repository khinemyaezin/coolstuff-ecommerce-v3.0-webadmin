import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss'],
})
export class PasswordChangeComponent implements OnInit {
  @Output('submit') submit = new Subject<string>();
  authenForm: FormGroup = new FormGroup({
    current_password: new FormControl(''),
    newPassword: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });
  get matchPassword(): boolean {
    return (
      this.authenForm.get('newPassword')?.value ==
      this.authenForm.get('confirmPassword')?.value
    );
  }
  constructor() {}

  ngOnInit(): void {}

  submitChangePassword(){
    this.submit.next(this.authenForm.get('newPassword')?.value);
  }
}
