import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  @ViewChild('defLocation') defLocationModel: any;

  defaultLocation = new FormGroup({
    default: new FormControl(),
  });
  locations: any[] = [];

  constructor(
    private modalService: NgbModal,
    private http: ServerService,
    private popup: PopupService
  ) {}

  ngOnInit(): void {
    this.intLocations();
  }

  openDefLocationChange() {
    this.defaultLocation.get('default')?.setValue(
      this.locations.find((loc:any)=> loc.default )?.id
    )
    this.modalService
      .open(this.defLocationModel, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        size: 'lg',
      })
      .result.then(
        (result) => {},
        (reason) => {}
      );
  }

  intLocations() {
    lastValueFrom(this.getLocations()).then((resp) => {
      this.locations = resp.success ? resp.details : [];
    });
  }

  submitDefLocation(modalRef: any) {
    modalRef.close();
    const param = {
      default: this.defaultLocation.get('default')?.value,
    };
    lastValueFrom(this.updateDefaultLocation(param)).then((resp) => {
      if (resp.success) {
        this.popup.showSuccessToast("Success");
      }
    });
  }

  /**
   * HTTP
   */
  getLocations() {
    return this.http.GET('locations');
  }
  updateDefaultLocation(param: any) {
    return this.http.PUT(`locations/default`, param);
  }
}
