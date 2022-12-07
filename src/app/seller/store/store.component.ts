import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  formGroup = new FormGroup({
    price: new FormControl(0),
  });

  mask = {
    mask: '$ ',
    lazy: false,

    blocks: {
      YY: {
        mask: Number,
      },
    },
  };
  constructor() {}

  ngOnInit(): void {
    this.formGroup.valueChanges.subscribe(
      changes=>{
        console.log(changes);
        
      }
    )
  }

  troggle() {
    var element: any = document.getElementById('pbar');
    element.classList.toggle('showAnim');
  }
}
