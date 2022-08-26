import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  constructor(
    private pgservice: ControllerService,
    private popup: PopupService,
    private http: ServerService
  ) {}
  formControl = new FormControl();
  ngOnInit(): void {}
  submit() {
    const formData = new FormData();
    formData.append('file', this.formControl.value);
    this.http.POST('upload', formData).subscribe({
      next: (v) => {
        console.log(v);
        
      },
      error: (err) => {
        console.log(err);
        
      },
    });
  }
}
