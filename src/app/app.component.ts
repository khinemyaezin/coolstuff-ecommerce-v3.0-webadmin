import { AfterViewInit, Component } from '@angular/core';
import { easepick } from '@easepick/bundle';

export interface Menus {
  id: string;
  icon: string;
  title: any;
  routerLink: string;
  collapse:boolean;
  children: Menus[];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {

  }

}
