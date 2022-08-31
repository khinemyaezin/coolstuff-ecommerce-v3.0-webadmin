import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  });

  constructor(
    private http: ServerService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit(): void {}

  login() {
    if (!this.loginFormGroup.valid) return;

    // Prepare to login.
    let param = {
      email: this.loginFormGroup.controls['email'].value,
      password: this.loginFormGroup.controls['password'].value,
    };
    // Send request to server.
    this.http.POST('login', param).subscribe({
      next: (body) => {
        if (body.status == 200) {
          this.authService.signin(body.details);
          this.authService.identifyUser();
          
        }
      },
      error: (e) => {
        console.log(e);
        
      },
    });
  }
}
