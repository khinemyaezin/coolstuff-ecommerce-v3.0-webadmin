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
    // $('#main').html('hello');
    // let bootstraps = new bootstrap.Modal(document.getElementById('exampleModal'));
    // bootstraps.show();

    // const picker = new easepick.create({
    //   element: document.getElementById('datepicker') as HTMLElement,
    //   css: [
    //     'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css',
    //   ],
    // });

  }

}
