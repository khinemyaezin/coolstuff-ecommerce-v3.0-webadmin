import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Subject } from 'rxjs';
import { Utility } from 'src/app/services/utility.service';
import { ImageCropperConfig } from '../media-chooser/media-chooser.component';

@Component({
  selector: 'app-image-cropper-model',
  templateUrl: './image-cropper-model.component.html',
  styleUrls: ['./image-cropper-model.component.scss'],
})
export class ImageCropperModelComponent implements OnInit {
  @Input() public modelRef!: NgbModalRef;
  @Input('config') config!: ImageCropperConfig;
  @Output('resultImage') resultImage: any = new Subject();
  @Output('error') error: any = new Subject();
  @ViewChild('imgcrop') imageCropper!: ImageCropperComponent;


  constructor(private pgService: Utility) {}

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
    
  }

  imageCropped(event: ImageCroppedEvent) {
    this.modelRef.close(event)
  }
  imageLoaded() {}
  cropperReady() {}
  loadImageFailed() {}
  finishedCropImage() {
    this.imageCropper.crop();
  }
  cancel() {
    this.modelRef.close(null)
  }

  
}
