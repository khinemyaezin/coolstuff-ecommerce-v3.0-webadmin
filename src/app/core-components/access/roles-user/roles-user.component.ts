import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
import { RoleUserSaveRequest } from 'src/app/services/requests';
import { ServerService } from 'src/app/services/server.service';
import { AccessControlService } from '../access-control.service';

@Component({
  selector: 'roles-user',
  templateUrl: './roles-user.component.html',
  styleUrls: ['./roles-user.component.scss'],
})
export class RolesUserComponent implements OnInit, OnDestroy {
  @Input('id') userID!: string;
  rolesForm = new FormGroup({
    roles: new FormArray([]),
  });
  destroy$: Subject<boolean> = new Subject<boolean>();

  get getRoles() {
    return this.rolesForm.get('roles') as FormArray;
  }
  constructor(
    private service: AccessControlService,
    private fbuilder: FormBuilder,
    private util: ControllerService,
    private http: ServerService,
    private alert: PopupService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.getUserRoles();
  }
  openRolesEditor(roleID: string) {
    try {
      this.service.openRolesManager(roleID);
    } catch (error) {
      console.log(error);
    }
  }
  getUserRoles() {
    lastValueFrom(this.service.getUserRoles(this.userID)).then((resp) => {
      if (resp.success) {
        resp.details.forEach((r: any) => {
          let role = this.fbuilder.group(r);
          const checked = !this.util.isEmptyID(r.fk_user_id);
          role.addControl('checked', new FormControl(checked));

          this.getRoles.push(role);
        });
      }
    });
  }
  submit() {
    const param: RoleUserSaveRequest = {
      roles: this.getRoles.controls
        .filter((role: AbstractControl) => {
          return role.get('checked')?.value;
        })
        .map((role) => {
          return {
            id: role.get('id')?.value.toString(),
          };
        }),
    };
    lastValueFrom(this.service.updateUserRoles(this.userID, param)).then(
      (resp) => {
        this.alert.showTost(resp.message);
        if (!resp.success) {
          this.getUserRoles();
        } else {
          this.rolesForm.markAsPristine();
        }
      }
    );
  }
}
