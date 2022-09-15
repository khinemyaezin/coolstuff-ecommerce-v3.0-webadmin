import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserTypes } from '../services/core';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private curUser!: User;
  constructor(private router: Router) {}

  get user() {
    return this.curUser;
  }

  get userType(): UserTypes {
    return this.curUser.user_type;
  }

  get isSeller(): boolean {
    return this.isLogin() && this.userType == UserTypes.SELLER;
  }

  get isAdmin(): boolean {
    return this.isLogin() && this.userType == UserTypes.ADMIN;
  }

  get isUser(): boolean {
    return this.isLogin() && this.userType == UserTypes.USER;
  }

  public signin(request: any, fromLogin: boolean = true): boolean {
    const userType: UserTypes | null = this.identifyUser(
      request.user.user_type.id
    );
    if (!userType) {
      throw new Error('Invalid User');
    }

    this.curUser = {
      id: request.user.id,
      status: request.user.status,
      first_name: request.user.first_name,
      last_name: request.user.last_name,
      nrc_value: request.user.nrc_value,
      profile_image: request.user.profile_image,
      email: request.user.email,
      phone: request.user.phone,
      address: request.user.address,
      brand: request.user.brand,
      user_type: userType,
      user_roles: request.roles,
    };
    if (fromLogin) this.redirectUserToHomePage();
    return true;
  }

  public isLogin(): boolean {
    return this.curUser ? true : false;
  }

  private identifyUser(userTypeId: string) {
    switch (userTypeId) {
      case UserTypes.SELLER:
        return UserTypes.SELLER;
      case UserTypes.ADMIN:
        return UserTypes.ADMIN;
      default:
        return null;
    }
  }

  private redirectUserToHomePage() {
    switch (this.curUser.user_type) {
      case UserTypes.SELLER:
        this.router.navigateByUrl('/seller-central');
        break;
      case UserTypes.ADMIN:
        this.router.navigateByUrl('/admin');
        break;
    }
  }
}
