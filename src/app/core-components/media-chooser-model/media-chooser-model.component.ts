import { HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import {
  CsHttpObserveType,
  ServerService,
} from 'src/app/services/server.service';
import { PopupService } from 'src/app/services/popup.service';
import {
  ImageCropperConfig,
  MediaChooserConfig,
} from '../media-chooser/media-chooser.component';
import { ControllerService } from 'src/app/services/controller.service';
import { base64ToFile } from 'ngx-image-cropper';

export interface Media {
  id: string;
  status: number;
  biz_status: number;
  title: string;
  path: string;
  mime_type: string;
  extension: string;
  fk_brand_id: number;
  created_at: string;
  updated_at: string;
  ratio: string;
}

@Component({
  selector: 'app-media-chooser-model',
  templateUrl: './media-chooser-model.component.html',
  styleUrls: ['./media-chooser-model.component.scss'],
})
export class MediaChooserModelComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() public files!: any;
  @Input() public modelRef!: NgbModalRef;
  @Input() public httpParam!: HttpParams;
  @Input() public config!: MediaChooserConfig;

  mediaChooser = new FormGroup({
    filesFormControl: new FormControl(),
    selectedMedia: new FormControl(),
  });

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public activeModal: NgbActiveModal,
    private popup: PopupService,
    private http: ServerService,
    private service: ControllerService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.mediaChooser.controls['filesFormControl'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((files: File[] | null) => {
        if (files) this.uploadFiles(files);
      });

    this.mediaChooser.controls['selectedMedia'].valueChanges.subscribe(
      (selected: any) => {
        console.log(selected);
      }
    );
    console.log(this.config.ratio?.split('/', 2));
  }

  async uploadFiles(files: File[]) {
    const cropperResultArray:any[] = await this.correctRatio(files);
    if(cropperResultArray.length == 0 ) return;
    
    
    let formData = new FormData();
    for( let cropperResult of cropperResultArray) {
      formData.append('images[]', cropperResult.croppedFile);
    }    
    let param = new HttpParams();
    param = param.append('ratio', this.config?.ratio ?? '1/1');

    this.http.POST('files',formData, { observe: CsHttpObserveType.event, httpParam: param }).subscribe({
      next: (resp: HttpEvent<any>) => {
        switch (resp.type) {
          case HttpEventType.UploadProgress:
            console.log(
              `progress - ${Math.round(
                (resp.loaded * 100) / (resp.total as any)
              )}`
            );
            break;
          case HttpEventType.Response: {
            //this.modelRef.close(resp);
            this.popup.getMedias(this.httpParam).then((value) => {
              this.files = value;
              this.mediaChooser.controls['filesFormControl'].reset();
              this.mediaChooser.controls['selectedMedia'].setValue(
                resp.body.details[0].id
              );
            });
          }
        }
      },
      error: (err) => {
        this.modelRef.close(null);
      },
    });
  }

  private async correctRatio(files: File[]) {
    let resultArray: any[] = [];
    return new Promise<any[]>(async (res, rej) => {
      for (let file of files) {
        let readedFile = await this.service.readFile(file);


        if (readedFile) {
          // Convert file into Image 
          let image = (await this.service.readImage(readedFile)) as any;

          if (image.height !== image.width) { // check an image have correct aspect ratio

            // convert ratio string to normal ratio number
            let ratioArray = this.config.ratio?.split('/', 2);
            ratioArray = ratioArray ?? ['1', '1'];
            const config: ImageCropperConfig = {
              base64: readedFile,
              ratio: parseInt(ratioArray[0]) / parseInt(ratioArray[1]),
            };

            // load image cropper model
            const resultModel = await this.popup.showImageCropperModal(config);
            if (resultModel) {

              // convert cropped base64 string to file to upload as formdata;
              resultArray.push(
                Object.assign(resultModel, {
                  croppedFile: new File(
                    [base64ToFile(resultModel.base64)],
                    file.name,
                    {
                      lastModified: file.lastModified,
                      type: file.type,
                    }
                  ),
                })
              );
            }
          } else {
            resultArray.push({
              croppedFile : file
            });
          }
        }
      }
      res(resultArray);
    });
  }

  pageChanges(url: string) {
    lastValueFrom(this.http.fetch(url)).then((value: any) => {
      if (value.success) {
        this.files = value.details;
      }
    });
  }
  
  change(e: any) {}

  submit() {
    this.modelRef.close(
      this.files.data.find((value: any) => {
        return value.id == this.mediaChooser.controls['selectedMedia'].value;
      })
    );
  }
}
