import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionGroupFilter'
})
export class OptionGroupFilterPipe implements PipeTransform {

  transform(value: [], ...args: unknown[]): [] {
    return []
  }

}
