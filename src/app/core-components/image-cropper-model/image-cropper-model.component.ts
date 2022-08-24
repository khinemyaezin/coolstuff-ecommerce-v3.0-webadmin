import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { ControllerService } from 'src/app/services/controller.service';

@Component({
  selector: 'app-image-cropper-model',
  templateUrl: './image-cropper-model.component.html',
  styleUrls: ['./image-cropper-model.component.scss'],
})
export class ImageCropperModelComponent implements OnInit {
  @Input('imageBase64') base64: any = null;
  @Input('ratio') ratio: any = 1 / 1;
  @Output('resultImage') resultImage: any = new EventEmitter();
  @Output('error') error: any = new EventEmitter();
  @ViewChild('imgcrop') imageCropper!: ImageCropperComponent;
  @Output()
  closed = new EventEmitter();
  @Output()
  ready = new EventEmitter();
  modal: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageBase64: any = null;
  cropRatio = 1 / 1;

  constructor(private pgService: ControllerService) {}

  ngAfterViewInit(): void {
    // this.modal = new bootstrap.Modal(
    //   document.getElementById('image-cropper-modal'),
    //   { backdrop: 'static' }
    // );
    // this.modal.show();
    // const modal = document.getElementById('image-cropper-modal') as any;
    // modal.addEventListener('hidden.bs.modal', () => {
    //   this.closed.emit(this.croppedImage);
    // });
    // this.ready.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.imageBase64 = this.base64;
    this.cropRatio = this.ratio;
  }

  ngOnInit(): void {
    this.imageBase64 = this.base64;
    this.cropRatio = this.ratio;
  }

  imageCropped(event: ImageCroppedEvent) {
    console.log('imageCropped');
    this.croppedImage = event.base64;
    this.modal.hide();
    // this.resultImage.emit(event.base64)
  }
  imageLoaded() {}
  cropperReady() {}
  loadImageFailed() {}
  finishedCropImage() {
    this.imageCropper.crop();
  }
  cancel() {
    this.croppedImage = null;
    this.modal.hide();
  }
}
