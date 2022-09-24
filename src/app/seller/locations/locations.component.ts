import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
@ViewChild('defLocation') defLocationModel:any;
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
  }

  openDefLocationChange() {
    this.modalService.open(this.defLocationModel, {
      ariaLabelledBy: 'modal-basic-title',
      centered:true,
      size:'lg'
    }).result.then((result) => {
      
    }, (reason) => {
      
    });
  }
}
