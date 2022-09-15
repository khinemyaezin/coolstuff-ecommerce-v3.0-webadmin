import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'user-controls-menu',
  templateUrl: './user-controls-menu.component.html',
  styleUrls: ['./user-controls-menu.component.scss']
})
export class UserControlsMenuComponent implements OnInit {
  userImage:any = "";
  userName:any = "";

  constructor(private http:ServerService,private popup:PopupService,private auth:AuthService) { }

  ngOnInit(): void {
    this.userImage = this.auth.user.profile_image?.path;
    this.userName = this.auth.user.first_name
  }
  logout(){
    lastValueFrom(this.http.logout()).then(
      (resp)=>{
        this.popup.showTost(resp.message);
        window.location.reload();
      }
    )
  }
}
