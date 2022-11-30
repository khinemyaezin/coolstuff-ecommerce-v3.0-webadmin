import { Pipe, PipeTransform } from '@angular/core';
import { ControllerService } from '../services/controller.service';

@Pipe({
  name: 'defaultEmptyString',
})
export class DefaultEmptyStringPipe implements PipeTransform {
  constructor(private util:ControllerService){

  }
  transform(value: string, ...args: string[]): string {
    if (this.util.isEmptyOrSpaces(value)) {
      return '-';
    } else {
      return value;
    }
  }
}
