import { Component, Input, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Session } from 'src/app/services/core';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'session-devices',
  templateUrl: './session-devices.component.html',
  styleUrls: ['./session-devices.component.scss'],
})
export class SessionDevicesComponent implements OnInit {
  @Input('id') userID!:string;
  sessions: Session[] = [];

  constructor(private http: ServerService) {}

  ngOnInit(): void {
    this.getCurrentUserSessions();
  }

  getCurrentUserSessions() {
    lastValueFrom(this.http.GET(`users/${this.userID}/sessions`)).then((resp) => {
      this.sessions = resp.details;
    });
  }
  
  terminate(id:any){
    lastValueFrom( this.http.DELETE(`users/${this.userID}/sessions/${id}`) ).then(
      resp=> {
        if(resp.success) {
          this.sessions = this.sessions.filter( session=>{
            return session.id !== id;
          })
        }
      }
    )
  }
}
