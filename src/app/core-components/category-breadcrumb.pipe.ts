import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryBreadcrumb'
})
export class CategoryBreadcrumbPipe implements PipeTransform {

  transform(value: string, ...args: string[]): string[] {
    if(value) {
      let path = value.split('/');
      path.shift();
      return path;
    }else{
      return [];
    }
  }

}
