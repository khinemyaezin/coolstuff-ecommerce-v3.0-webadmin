import { Pipe, PipeTransform } from '@angular/core';
import { Utility } from '../services/utility.service';

@Pipe({
  name: 'defaultEmptyString',
})
export class DefaultEmptyStringPipe implements PipeTransform {
  constructor(private util:Utility){

  }
  transform(value: string, ...args: string[]): string {
    if (this.util.isEmptyOrSpaces(value)) {
      return '-';
    } else {
      return value;
    }
  }
}
