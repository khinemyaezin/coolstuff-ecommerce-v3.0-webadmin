import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginData } from 'src/app/interfaces/request-data';
import { ResponseObject } from 'src/app/interfaces/response-data';
import { ServerService } from 'src/app/services/server.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  loginFormGroup: FormGroup = new FormGroup({
    email: new FormControl('admin@nike.com', [
      Validators.required,
      Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
    ]),
    password: new FormControl('123'),
    isAdmin: new FormControl<boolean>(false)
  });

  constructor(
    private http: ServerService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit(): void {}

  login() {
    //<< Prepare to login.>>
    let param = {
      email: this.loginFormGroup.controls['email'].value,
      password: this.loginFormGroup.controls['password'].value,
    };

    if(this.loginFormGroup.get('isAdmin')?.value) {
      param.email = 'admin@gmail.com',
      param.password = '123';
    }
    //<< Send request to server.>>
    this.http.POST('login', param).subscribe({
      next: (body:ResponseObject<LoginData>) => {
        if (body.success) {
          this.authService.signin(body.details);          
        }
      },
      error: (e) => {
        console.log(e);
        
      },
    });
  }
}
