import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Observable, Subject, takeUntil } from 'rxjs';

import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {

  userID!:string;

  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    public popup: PopupService,
    public activatedRoute: ActivatedRoute,
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  ngOnInit(): void {
    const param: Observable<any> = this.activatedRoute.params;
    param.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      this.userID = param.id;
    });
  }

}
