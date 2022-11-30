import { Component, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss'],
})
export class PasswordChangeComponent implements OnInit {
  @Input('id') userID!:string;

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
  constructor(public popup: PopupService, private http: ServerService) {}

  ngOnInit(): void {}

  submitChangePassword() {
    const param = {
      password: this.authenForm.get('newPassword')?.value,
    };
    this.http.PUT(`users/${this.userID}/password`, param).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.popup.showTost('Success');
        } else {
          this.popup.showTost(resp.message);
        }
      },
      error: (e) => {
        this.popup.showTost(e);
        console.log(e);
      },
    });
  }
}
