import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[backButton]'
})
export class BackButtonDirective implements OnInit,OnDestroy,AfterViewInit{
  @Input() name: string = '';
  @Input() icon: string = '';

  constructor(private elementRef:ElementRef,private render:Renderer2) { }

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {

    this.render.addClass(this.elementRef.nativeElement,'btn');
    this.render.addClass(this.elementRef.nativeElement,'btn-link');

    let icon = document.createElement('i');
    this.icon.split(' ').forEach( className=>{
       icon.classList.add(className);
    })

    let title = document.createElement('span');
    title.innerHTML = this.name;
    //this.render.setStyle(this.elementRef.nativeElement, 'margin-left', '-1rem');
    this.render.appendChild(this.elementRef.nativeElement,icon);
    this.render.appendChild(this.elementRef.nativeElement,title);
  }
  ngOnDestroy(): void {
    
  }

}
