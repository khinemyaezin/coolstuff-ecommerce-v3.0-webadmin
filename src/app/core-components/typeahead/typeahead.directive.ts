import { Directive, forwardRef, OnChanges, SimpleChanges, ElementRef, Renderer2 } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Directive({
  selector: 'input[csTypeahead]',
})
export class TypeaheadDirective implements OnChanges {

  constructor(private element: ElementRef, private render: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('typeahead change',changes);
  }
}
