import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-attribute-selector',
  templateUrl: './attribute-selector.component.html',
  styleUrls: ['./attribute-selector.component.scss'],
})
export class AttributeSelectorComponent implements OnInit {
  @Input() public modelRef: any;
  @Input() public attribute!: FormGroup;

  get header() {
    return this.attribute.get('optionHeader');
  }
  get detail() {
    return this.attribute.get('optionDetail');
  }
  get unit() {
    return this.attribute.get('optionUnit');
  }
  constructor(
    public activeModal: NgbActiveModal,
    public fb: FormBuilder,
    private http: ServerService,

  ) {}

  ngOnInit(): void {
    this.getUnits();
  }

  compare(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }
  formatter = (x: { id: string; title: string }) => x.title;

  getUnits() {
    if (this.attribute.get('optionUnitLoad')?.value) return;
    const headerId = this.header?.value.id;

    lastValueFrom(this.getOptionUnits(headerId)).then((resp) => {
      this.attribute.get('optionUnitLoad')?.setValue(true);
      this.attribute.get('optionUnitArray')?.setValue(resp.details.data);
    });
  }
  getOptionUnits(headerId: string, param?: { key: string; value: any }[]) {
    let httpParam = new HttpParams();
    param?.forEach((filter) => {
      httpParam = httpParam.append(filter.key, filter.value);
    });
    return this.http.GET(`options/headers/${headerId}/units`, httpParam);
  }
}
