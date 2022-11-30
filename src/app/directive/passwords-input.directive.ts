import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[passwordShowHide]',
})
export class PasswordsInputDirective implements OnDestroy {
  private onClickUnListener: () => void;
  private shownPassword = false;

  constructor(private elementRef: ElementRef, private render: Renderer2) {
    const i = this.render.createElement('i');

    let iClass = [
      'bi',
      'bi-eye-slash',
      'position-absolute',
      'top-50',
      'end-0',
      'translate-middle-y',
      'text-muted',
      'fs-base',
      'me-2',
    ];

    for (let ii = 0; ii < iClass.length; ii++) {
      this.render.addClass(i, iClass[ii]);
    }

    this.render.setAttribute(i,'role','button')

    this.onClickUnListener = this.render.listen(i, 'click', (event: any) => {
      if (this.shownPassword) {
        this.render.setAttribute(this.elementRef.nativeElement, 'type', 'text');
        this.shownPassword = !this.shownPassword;
        this.render.removeClass(i,'bi-eye-slash');
        this.render.addClass(i,'bi-eye');
      }else {
        this.render.setAttribute(this.elementRef.nativeElement, 'type', 'password');
        this.shownPassword = !this.shownPassword;
        this.render.removeClass(i,'bi-eye');
        this.render.addClass(i,'bi-eye-slash');
      }
    });
    this.render.appendChild(this.elementRef.nativeElement.parentNode, i);
  }
  ngOnDestroy(): void {
    this.onClickUnListener();
  }
}
