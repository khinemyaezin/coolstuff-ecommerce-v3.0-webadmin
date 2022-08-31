import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerService } from '../services/server.service';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  constructor(private http: ServerService) {}

  getConditionList() {
    return this.http.GET('conditions');
  }
  marginPercentage(price1: number, price2: number): number[] {
    let profit = price1 - price2;
    let margin = (price1 - price2) / price1;
    return [profit, margin];
  }

  regions(params: [{ key: string; value: string }] | null = null) {
    let httpParams = new HttpParams();
    if (params) {
      params.forEach((data) => {
        httpParams = httpParams.set(data.key, data.value);
      });
    }
    return this.http.GET('regions',httpParams);
  }
}
