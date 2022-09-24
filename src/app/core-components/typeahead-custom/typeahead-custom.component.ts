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
      input.ng-dirty.ng-valid {
        border-color: #00800038;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='rgb(27 137 27)' class='bi bi-emoji-smile' viewBox='0 0 16 16'%3E%3Cpath d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/%3E%3Cpath d='M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z'/%3E%3C/svg%3E");
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
  @Output('selectItem') selectItem = new Subject();

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
            if (values.success) {
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
