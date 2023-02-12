import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserProfileComponent } from 'src/app/core-components/user-profile/user-profile.component';
import { User, UserTypes } from 'src/app/services/core';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-users-and-permission',
  templateUrl: './users-and-permission.component.html',
  styleUrls: ['./users-and-permission.component.scss'],
})
export class UsersAndPermissionComponent implements OnInit, OnDestroy {
  storeOwners: User[] = [];
  staffs: User[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private auth: AuthService,
    private http: ServerService,
    private modalService: NgbModal
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.getUsersByUserType();
  }

  openNewStaffModel() {
    const modalRef = this.modalService.open(UserProfileComponent, {
      size: 'lg',
      centered: true,
      scrollable: true,
    });
    modalRef.componentInstance.type = 'model';
    modalRef.componentInstance.title = 'Create a new staff';
    modalRef.componentInstance.userType = UserTypes.STAFF;

    modalRef.componentInstance.userResponse
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: any) => {
        if (resp.success) this.getUsersByUserType();
        modalRef.close();
      });
  }
  getUsersByUserType() {
    this.requestUsersByUserType().then((result) => {
      if (result.success) {
        result.details.forEach((userType: any) => {
          if (userType.id == UserTypes.SELLER) {
            this.storeOwners = userType.users;
          } else {
            this.staffs = userType.users;
          }
        });
      }
    });
  }

  //HTTPS
  requestUsersByUserType() {
    return lastValueFrom(this.http.GET('usertypes/users'));
  }
}
