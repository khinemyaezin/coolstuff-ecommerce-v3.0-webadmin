import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
import { RoleSaveRequest, RoleUpdateRequest } from 'src/app/services/requests';
import { AccessControlService } from '../access-control.service';

interface RoleTask {
  task_id: string;
  role_id: null | string;
  checked: boolean;
}
interface Role {
  id: string;
  biz_status: number;
  code: string;
  title: string;
  description: string;
}
interface Task {
  id: string;
}

@Component({
  selector: 'app-roles-manager',
  templateUrl: './roles-manager.component.html',
  styleUrls: ['./roles-manager.component.scss'],
})
export class RolesManagerComponent implements OnInit {
  @ViewChild('nav', { static: true }) navTab!: NgbNav;
  @Input() public activeRoleID: string = '';

  newID = '-1';
  roles: Role[] = [];
  roleForm = new FormGroup({
    roleTitle: new FormControl<string>(''),
    activeRoleTasks: new FormArray([]),
  });

  get getActiveRoleTask() {
    return this.roleForm.get('activeRoleTasks') as FormArray;
  }

  constructor(
    private service: AccessControlService,
    private formBuilder: FormBuilder,
    private util: ControllerService,
    private alert: PopupService
  ) {}

  ngOnInit(): void {
    this.getRoles();
    this.getTasksByRoleID();
  }

  getRoles() {
    lastValueFrom(this.service.getRoles()).then((resp) => {
      this.roles = resp.success ? resp.details.data : [];

      const newRole: Role = {
        id: '-1',
        biz_status: 0,
        code: '',
        title: '...',
        description: '',
      };
      this.roles.push(newRole);
    });
  }

  getTasksByRoleID() {
    lastValueFrom(this.service.getTaskByRoleID(this.activeRoleID)).then(
      (resp) => {
        if (resp.success) {
          this.getActiveRoleTask.clear();
          resp.details.forEach((data: RoleTask) => {
            let taskFg = this.formBuilder.group(data);
            taskFg.addControl(
              'checked',
              new FormControl<boolean>(!this.util.isEmptyID(data.role_id))
            );
            this.getActiveRoleTask.push(taskFg);
          });
        }
      }
    );
  }

  getTasks() {
    lastValueFrom(this.service.getTasks()).then((resp) => {
      this.getActiveRoleTask.clear();
      resp.details.forEach((data: Task) => {
        let roleTask: RoleTask = {
          task_id: data.id,
          role_id: null,
          checked: false,
        };
        let taskFg = this.formBuilder.group(roleTask);
        this.getActiveRoleTask.push(taskFg);
      });
    });
  }

  roleTabChange(e: NgbNavChangeEvent | null = null) {
    this.activeRoleID = e ? e.nextId : this.activeRoleID;
    if (this.util.isEmptyID(this.activeRoleID)) {
      // << New Role >>
      this.getTasks();
    } else {
      // << Old >>
      this.getTasksByRoleID();
    }
  }

  submit() {
    const tasks = this.getActiveRoleTask.controls
      .filter((task: AbstractControl) => {
        return task.get('checked')?.value;
      })
      .map((task: AbstractControl) => {
        return {
          id: task.get('task_id')?.value.toString(),
        };
      });

    if (this.util.isEmptyID(this.activeRoleID)) {
      // New Request
      const roleSaveRequest: RoleSaveRequest = {
        title: this.roleForm.get('roleTitle')?.value?.trim() ?? '',
        tasks: tasks,
      };
      lastValueFrom(this.service.saveRole(roleSaveRequest)).then((resp) => {
        this.alert.showTost(resp.message);
        if (resp.success) {
          this.activeRoleID = resp.details;
          this.getRoles();
          this.getTasksByRoleID();
        }
      });
    } else {
      const roleUpdateRequest: RoleUpdateRequest = {
        tasks: tasks,
      };
      lastValueFrom(
        this.service.updateRole(this.activeRoleID, roleUpdateRequest)
      ).then((resp) => {
        this.alert.showTost(resp.message);
      });
    }
  }
}
