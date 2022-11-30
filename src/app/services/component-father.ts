import { Component } from "@angular/core";

@Component({
    template:''
})
export class ComponentFather {
  constructor() {}
  compare(a: any, b: any) {
    if (a && b) return a.id.toString() === b.id.toString();
    else return false;
  }
}
