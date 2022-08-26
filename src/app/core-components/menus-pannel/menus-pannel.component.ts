import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Menus } from 'src/app/app.component';

@Component({
  selector: 'menus',
  templateUrl: './menus-pannel.component.html',
  styleUrls: ['./menus-pannel.component.scss']
})
export class MenusPannelComponent implements OnInit,AfterViewInit {
  @Input("menus") menus: Menus[] = [];
  @Input('offcanvas') public offControl:any;

  public isCollapsed = false;

  constructor() { }
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
  }

}
