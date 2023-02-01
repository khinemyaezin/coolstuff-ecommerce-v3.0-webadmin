import { Pipe, PipeTransform } from '@angular/core';
import { Utility } from '../services/utility.service';

@Pipe({
  name: 'defaultEmptyString',
})
export class DefaultEmptyStringPipe implements PipeTransform {
  constructor(private util:Utility){

  }
  transform(value: any, ...args: string[]): string {
    if (this.util.isEmptyOrSpaces(value)) {
      return args.length !== 0 ? args[0] : '-';
    } else {
      return value;
    }
  }
}
