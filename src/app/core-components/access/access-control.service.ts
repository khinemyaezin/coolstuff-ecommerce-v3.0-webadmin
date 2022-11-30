import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  RoleSaveRequest,
  RoleUpdateRequest,
  RoleUserSaveRequest,
} from 'src/app/services/requests';
import { ServerService } from 'src/app/services/server.service';
import { RolesManagerComponent } from './roles-manager/roles-manager.component';

@Injectable({
  providedIn: 'root',
})
export class AccessControlService {
  constructor(private http: ServerService, private modalService: NgbModal) {}

  openRolesManager(roleID: string = '') {
    const modalRef = this.modalService.open(RolesManagerComponent, {
      size: 'lg',
      centered: true,
      scrollable: true,
    });
    modalRef.componentInstance.activeRoleID = roleID.toString();
  }

  getUserRoles(userID: string) {
    return this.http.GET(`users/${userID}/roles`);
  }

  updateUserRoles(userID: string, param: RoleUserSaveRequest) {
    return this.http.PUT(`users/${userID}/roles`, param);
  }

  getRoles() {
    return this.http.GET('access-control/roles');
  }

  getTaskByRoleID(id: string) {
    return this.http.GET(`access-control/roles/${id}/tasks`);
  }

  getTasks() {
    return this.http.GET('access-control/tasks');
  }

  updateRole(roleID: string, param: RoleUpdateRequest) {
    return this.http.PUT(`access-control/roles/${roleID}`, param);
  }

  saveRole(param: RoleSaveRequest) {
    return this.http.POST(`access-control/roles`, param);
  }
}
