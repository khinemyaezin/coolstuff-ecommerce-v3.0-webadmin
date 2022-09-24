import { KeyValue } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, lastValueFrom, map, Subject, takeUntil } from 'rxjs';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit,OnDestroy {
  @ViewChild('newDepartmentModel') newDepartmentModel: any;
  @Input('style') layoutStyle: number = -1;
  @Output('output') output: any = new EventEmitter();

  catFormGroup: FormGroup = new FormGroup({
    list: new FormControl([]),
  });

  catNewFormGroup: FormGroup = new FormGroup({
    pid: new FormControl('-1'),
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    path: new FormControl([]),
    category : new FormControl()
  });

  filter:FormControl = new FormControl('');
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    public pgService: ControllerService,
    public pops: PopupService,
    public http: ServerService,
    private modalService: NgbModal
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {

    this.getDepartments({'sub':1}).then((departments: any) => {
      this.catFormGroup.get('list')?.setValue( this.pgService.traverse(departments));
    });

    this.filter.valueChanges.pipe(takeUntil(this.destroy$),debounceTime(300)).subscribe(
      (changes:string)=>{
        if(!this.pgService.isEmptyOrSpaces(changes)){
          this.getDepartments({'title':changes}).then(
            (departments: any) => {
              this.catFormGroup.get('list')?.setValue( this.pgService.traverse(departments));
            }
          )
        }else {
          this.getDepartments({'sub':1}).then(
            (departments: any) => {
              this.catFormGroup.get('list')?.setValue( this.pgService.traverse(departments));
            }
          )
        }
      }
    )
  }

  getSubDepartments(item:any) {
    this.getDepartments({'sub': item.id}).then((departments: any) => {
      item.children = this.pgService.traverse(departments)[0].children;
    });
  }

  /** HTTPS */
  async getDepartments(criteria = {}):Promise<any[] | null> {
    
    let param = new HttpParams();
    Object.entries(criteria).forEach(
      ([key,value])=>{
        param = param.append(key,value as string );
      }
    )

    return lastValueFrom(
      this.http.GET(`categories`, param).pipe(
        map((resp: any) => {
          if (resp.success) {
           return resp.details
          } else {
            return null;
          }
        })
      )
    );
  }

  save(model:any) {
  
    const param = {
      parent_id: this.catNewFormGroup.get('pid')?.value,
      title: this.catNewFormGroup.get('name')?.value,
    };

    lastValueFrom(this.http.POST('categories', param)).then(
      (resp: any) => {
        model.close();
        if (resp.success) {
          this.pops.showTost('Success');
          this.getSubDepartments(this.catNewFormGroup.get('category')?.value);
          this.catNewFormGroup.reset();
        } else {
          this.pops.showTost(resp.message);
        }
      },
      (error) => {
        model.close();
        this.pops.showTost(error);
      }
    );
  }

  /** Controls */
  generateLeafForProducts() {
    // this.pgService.httpGet<string>('category/generate-leaf').then((e) => {
    // });
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {},
        (reason) => {}
      );
  }

  showNewDepartmentForm(item: { id: string; depth: number; name: string, children:any[] }) {
    console.log(item);
    
    this.catNewFormGroup.get('name')?.setValue('');
    this.catNewFormGroup.get('pid')?.setValue(item.id);
    this.catNewFormGroup.get('category')?.setValue(item);
    this.catNewFormGroup
      .get('path')
      ?.setValue(
        this.pgService
          .pathTo(this.catFormGroup.get('list')?.value, item.id)
          .split('/')
      );
    this.open(this.newDepartmentModel);
  }
}
