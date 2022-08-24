import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserTypes } from 'src/app/model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private curUser!: User;
  constructor(private router:Router) {}

  get user() {
    return this.curUser;
  }

  public signin(request: any) {
    this.curUser = new User(
      request.user.first_name,
      request.user.last_name,
      request.user.nrc_value,
      request.user.image_url,
      request.user.email,
      request.user.phone,
      request.user.address,
      request.user.brand,
      request.user.user_type,
      request.roles
    );
    return this.curUser;
    
  }

  public isLogin():boolean {
    return (this.curUser ? true : false);
  }

  public identifyUser() {
    if( this.curUser.user_type.title == UserTypes.SELLER) {
      this.router.navigateByUrl('/seller-central');

    }
  }

}
