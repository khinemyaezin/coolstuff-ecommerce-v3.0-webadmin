import { Component, OnInit, TemplateRef } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],

  host: {'class': 'toast-container position-fixed top-0 end-0 p-3', 'style': 'z-index: 1200'}
})
export class ToastComponent implements OnInit {

  constructor(public toastService: PopupService) {}

  isTemplate(toast:any) { return toast.textOrTpl instanceof TemplateRef; }

  ngOnInit(): void {
  }

}
