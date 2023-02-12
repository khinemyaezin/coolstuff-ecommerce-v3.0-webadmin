import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginData } from '../interfaces/request-data';
import { User, UserTypes } from '../services/core';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private curUser!: Partial<User>;
  constructor(private router: Router) {}

  get user() {
    return this.curUser;
  }

  get userType(): UserTypes {
    return this.curUser.user_type ?? UserTypes.USER;
  }

  get isSeller(): boolean {
    return this.isLogin() && (this.userType == UserTypes.SELLER || this.userType == UserTypes.STAFF);
  }

  get isAdmin(): boolean {
    return this.isLogin() && this.userType == UserTypes.ADMIN;
  }

  get isUser(): boolean {
    return this.isLogin() && this.userType == UserTypes.USER;
  }

  public signin(request: LoginData, fromLogin: boolean = true): boolean {
    const userType: UserTypes | null = this.identifyUser(
      request.user_type
    );
    if (!userType) {
      throw new Error('Invalid User');
    }

    this.curUser = {
      id: request.id,
      first_name: request.first_name,
      last_name: request.last_name,
      profile_image: request.profile_image,
      user_type: userType,
      user_roles: request.roles,
    };

    if (fromLogin) this.redirectUserToHomePage();
    return true;
  }

  public isLogin(): boolean {
    return this.curUser ? true : false;
  }

  private identifyUser(userTypeId: any) {
    try {
      const key =
        Object.keys(UserTypes)[Object.values(UserTypes).indexOf(userTypeId)];
      return UserTypes[key as keyof typeof UserTypes];
    } catch (error) {
      console.error('identifyUser', error);
      return null;
    }
  }

  private redirectUserToHomePage() {
    switch (this.curUser.user_type) {
      case UserTypes.SELLER: {
        this.router.navigateByUrl('/seller-central');
        console.log(this.curUser.user_type);
        break;
      }
      case UserTypes.STAFF: {
        this.router.navigateByUrl('/seller-central');
        console.log(this.curUser.user_type);
        break;
      }
      case UserTypes.ADMIN:
        this.router.navigateByUrl('/admin');
        break;
    }
  }
}
