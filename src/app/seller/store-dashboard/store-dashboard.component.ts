import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Utility } from 'src/app/services/utility.service';

@Component({
  selector: 'app-store-dashboard',
  templateUrl: './store-dashboard.component.html',
  styleUrls: ['./store-dashboard.component.scss']
})
export class StoreDashboardComponent implements OnInit {
  greetingTitle = this.getGreeting();

  constructor(private util:Utility,private auth:AuthService) { }

  ngOnInit(): void {
  }

  getGreeting() {
    return  `${this.util.getGreeting()}, ${this.auth.user.first_name} ${this.auth.user.last_name}`;
  }

}
