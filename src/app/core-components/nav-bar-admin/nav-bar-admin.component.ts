import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'nav-bar-admin',
  templateUrl: './nav-bar-admin.component.html',
  styleUrls: ['./nav-bar-admin.component.scss']
})
export class NavBarAdminComponent implements OnInit {
  brandProfileUrl:any;
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.brandProfileUrl = this.auth.user.brand.profile_image;

  }

}
