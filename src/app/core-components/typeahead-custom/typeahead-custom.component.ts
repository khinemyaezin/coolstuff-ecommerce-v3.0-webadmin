import { HttpParams } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup, NgControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { ServerService } from 'src/app/services/server.service';

export interface TypeaheadSource {
  url: string;
  params?: { key: string; value: string }[];
}
@Component({
  selector: 'typeahead-options',
  template: `
    <ng-container [formGroup]="formGroup">
      <ng-template #rt let-r="result" let-t="term">
        <ngb-highlight [result]="r.title" [term]="t"> </ngb-highlight>
      </ng-template>
      <input
        type="text"
        [class]="class"
        [placeholder]="placeholder"
        [formControlName]="formControlName"
        [ngbTypeahead]="searchOptions"
        [inputFormatter]="formatter"
        [resultTemplate]="rt"
        [editable]="false"
        (selectItem)="selectItem.next($event)"
      />
    </ng-container>
  `,
  styles: [
    `
      input {
        min-width: 10rem;
      }
      input.ng-valid {
        border-color: green;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
      }
    `,
  ],
})
export class TypeaheadCustomComponent implements OnInit, OnChanges {
  @ViewChild('input') inputRef!: ElementRef;
  @Input('optionFormGroup') formGroup!: FormGroup;
  @Input('optionFormControlName') formControlName!: string;
  @Input('formatter') formatter!: any;
  @Input('editable') editable: boolean = false;
  @Input('placeholder') placeholder: string = '';
  @Input('class') class: string = 'form-control input-number';
  @Input('source') source!: TypeaheadSource;
  @Output('selectItem') selectItem  = new Subject();

  constructor(private http: ServerService, private render: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {}

  searchOptions = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((changes) => {
        return this.request(changes).pipe(
          map((values: any) => {
            if (values.status == 200) {
              return values.details.data;
            } else {
              return [];
            }
          })
        );
      })
    );

  request(searchValue: string) {
    let httpParam = new HttpParams();
    if (this.source.params) {
      this.source.params.forEach((param) => {
        httpParam = httpParam.append(param.key, param.value);
      });
    }
    httpParam = httpParam.append('title', searchValue);
    return this.http.GET(this.source.url, httpParam);
  }
}
