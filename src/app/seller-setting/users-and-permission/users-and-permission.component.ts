import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User, UserTypes } from 'src/app/services/core';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-users-and-permission',
  templateUrl: './users-and-permission.component.html',
  styleUrls: ['./users-and-permission.component.scss'],
})
export class UsersAndPermissionComponent implements OnInit {
  storeOwners: User[] = [];
  staffs: User[] = [];
  constructor(private auth: AuthService, private http: ServerService) {}

  ngOnInit(): void {
    this.getUsersByUserType().then((result) => {
      if (result.success) {
        result.details.forEach((userType: any) => {
          if (userType.title == UserTypes.SELLER) {
            this.storeOwners = userType.users;
          } else {
            this.staffs = userType.users;
          }
        });
      }
    });
  }

  //HTTPS
  getUsersByUserType() {
    return lastValueFrom(this.http.GET('usertypes/users'));
  }
}
