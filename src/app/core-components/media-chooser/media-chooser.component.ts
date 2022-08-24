import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControllerService } from 'src/app/services/controller.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'media-chooser',
  templateUrl: './media-chooser.component.html',
  styleUrls: ['./media-chooser.component.scss']
})
export class MediaChooserComponent implements OnInit {

  @Input('src') media:string = "";
  @Input('title') title = "";
  @Output('output') output = new EventEmitter();

  constructor(
    public pgService: ControllerService,
    private popup : PopupService
  ) { }

  ngOnInit(): void {
  }
  async loadImage(e: any) {
    const input = e.srcElement;
    for (let f of input.files) {
      let base64 = await this.pgService.readFile(f);
      if (base64) {
        let image = (await this.pgService.readImage(base64)) as any;
        // if (image.height !== image.width) {
        //   this.popup
        //     .showImageCropperModal(image.src, 1 / 1)
        //     .then((e) => {
        //       this.media = e;
        //       this.output.emit(e)
        //     })
        //     .catch(() => {
        //       console.log("cancel");
        //     });
        // } else {
          this.media = image.src;
          this.output.emit(image.src);
        //}
      }
    }
  }
}
