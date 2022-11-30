import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userAgent'
})
export class UserAgentPipe implements PipeTransform {

  transform(value: string): string {
    if(value) {
      return value.split(" ")[0]
    }else {
      return 'unknown device';
    }
  }
}
