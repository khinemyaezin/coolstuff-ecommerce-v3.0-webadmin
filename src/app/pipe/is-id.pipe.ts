import { Pipe, PipeTransform } from '@angular/core';
import { Utility } from '../services/utility.service';

@Pipe({
  name: 'isId'
})
export class IsIdPipe implements PipeTransform {
  constructor(private util:Utility){

  }
  transform(value: any): boolean{
    return !this.util.isEmptyID(value)
  }

}
