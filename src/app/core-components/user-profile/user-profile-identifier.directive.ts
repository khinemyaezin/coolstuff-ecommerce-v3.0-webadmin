import {
  AfterViewInit,
  ChangeDetectorRef,
  ContentChild,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Directive({
  selector: '[appUserProfileIdentifier]',
})
export class UserProfileIdentifierDirective
  implements AfterViewInit
{
  @Input('type') type = 'model';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ref: ChangeDetectorRef
  ) {}

 

  ngAfterViewInit() {
    try {
      if (this.type != 'model') {
        this.renderer.addClass(
          this.el.nativeElement.querySelector('[element-type=wrapper]'),
          'card'
        );
      }

      this.renderer.addClass(
        this.el.nativeElement.querySelector('[element-type=header]'),
        this.type == 'model' ? 'modal-header' : 'card-header'
      );
      let title = this.el.nativeElement.querySelector('[element-type=title]');
      this.renderer.addClass(
        title,
        this.type == 'model' ? 'modal-title' : 'card-title'
      );
      if (this.type == 'model') {
        this.renderer.addClass(title, 'h4');
      }
    } catch (e) {
      console.log(e);
    }
  }
}
