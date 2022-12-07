import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, NgModel } from '@angular/forms';
import { GetProfitMarginRequest } from 'src/app/services/requests';
import { ServerService } from 'src/app/services/server.service';
import { Utility } from 'src/app/services/utility.service';
import { debounceTime, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export interface ProfitMarginResp {
  grossMargin: number;
  profit: number;
  salePrice: number;
  costOfItem: number;
  markup: number;
}

@Component({
  selector: 'app-profit-margin-calculator',
  templateUrl: './profit-margin-calculator.component.html',
  styleUrls: ['./profit-margin-calculator.component.scss'],
})
export class ProfitMarginCalculatorComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() public type: string = 'model';
  @Input() public costOfItem: any = 0;
  @Input() public modalRef!:NgbModalRef;

  profitMarginFormGroup = new FormGroup({
    costOfItem: new FormControl(0),
    salePrice: new FormControl(0),
    profit: new FormControl(0),
    grossMargin: new FormControl(0),
    markup: new FormControl(0),
  });

  currencyMaskOptions = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    allowNegative: false,
  };
  percentageMaskOptions = { ...this.currencyMaskOptions, min: 0, max: 100 };
  maskPipe = {
    mask: Number, // enable number mask

    // other options are optional with defaults below
    scale: 2, // digits after point, 0 for integers
    thousandsSeparator: ',', // any single char
    padFractionalZeros: true, // if true, then pads zeros at end to the length of scale
    normalizeZeros: false, // appends or removes zeros at ends
    radix: '.', // fractional delimiter
    mapToRadix: ['.'], // symbols to process as radix
  };

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: ServerService, private util: Utility) {}

  get profit() {
    return this.profitMarginFormGroup.get('profit')?.value;
  }
  get markup() {
    return this.profitMarginFormGroup.get('markup')?.value;
  }

  get grossMargin() {
    return this.profitMarginFormGroup.get('grossMargin')?.value;
  }

  get salePrice() {
    return this.profitMarginFormGroup.get('salePrice')?.value;
  }

  ngOnInit(): void {
    this.profitMarginFormGroup
      .get('costOfItem')
      ?.setValue(this.costOfItem, { eventEmit: false });

    this.profitMarginFormGroup
      .get('markup')
      ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe((changes) => {
        const request: Partial<GetProfitMarginRequest> = {
          cost_of_item:
            this.profitMarginFormGroup.get('costOfItem')?.value ?? 0,
          markup: changes ?? 0,
        };

        lastValueFrom(this.calculateProfitMargin(request)).then((resp) => {
          this.import(resp.details);
        });
      });

    this.profitMarginFormGroup
      .get('costOfItem')
      ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe((changes) => {
        if ((this.markup ?? 0) == 0 && (this.salePrice ?? 0) == 0) {
          return;
        }
        const request: GetProfitMarginRequest = {
          cost_of_item: changes ?? 0,
          markup: this.markup ?? 0,
          sale_price: this.salePrice ?? 0,
        };

        lastValueFrom(this.calculateProfitMargin(request)).then((resp) => {
          this.import(resp.details);
        });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  import(response: ProfitMarginResp) {
    Object.entries(response).forEach(([key, value]) => {
      this.profitMarginFormGroup
        .get(key)
        ?.setValue(value, { emitEvent: false });
    });
  }

  calculateProfitMargin(param: Partial<GetProfitMarginRequest>) {
    return this.http.POST('formulas/profit-margin', param);
  }

  submit(){
    this.modalRef.close(this.profitMarginFormGroup.value)
  }
}
