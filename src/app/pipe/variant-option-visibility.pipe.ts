import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'variantOptionVisibility',
  pure: false

})
export class VariantOptionVisibilityPipe implements PipeTransform {

  transform(value: AbstractControl[], ...args: any[]): boolean {    
    if(args[0] !== 0 && !value[args[0] - 1].get(args[1])?.value) {
      return false;
    }
    return true;
  }
}
