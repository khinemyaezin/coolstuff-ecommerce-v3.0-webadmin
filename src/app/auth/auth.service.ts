import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserTypes } from '../services/core';
import { ServerService } from '../services/server.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private curUser!: User;
  constructor(private router: Router) {}

  get user() {
    return this.curUser;
  }

  public signin(request: any) {
    this.curUser = {
      id:request.user.id,
      status:request.user.status,
      first_name: request.user.first_name,
      last_name: request.user.last_name,
      nrc_value: request.user.nrc_value,
      profile_image: request.user.profile_image,
      email: request.user.email,
      phone: request.user.phone,
      address: request.user.address,
      brand: request.user.brand,
      user_type: request.user.user_type,
      user_roles: request.roles,
    };

    return this.curUser;
  }

  public isLogin(): boolean {
    return this.curUser ? true : false;
  }

  public identifyUser() {
    if (this.curUser.user_type.title == UserTypes.SELLER) {
      this.router.navigateByUrl('/seller-central');
    }
  }
}
