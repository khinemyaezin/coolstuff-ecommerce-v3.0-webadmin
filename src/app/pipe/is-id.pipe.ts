import { Pipe, PipeTransform } from '@angular/core';
import { ControllerService } from '../services/controller.service';

@Pipe({
  name: 'isId'
})
export class IsIdPipe implements PipeTransform {
  constructor(private util:ControllerService){

  }
  transform(value: any): boolean{
    return !this.util.isEmptyID(value)
  }

}
