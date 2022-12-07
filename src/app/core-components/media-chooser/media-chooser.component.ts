import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Utility } from 'src/app/services/utility.service';
import { PopupService } from 'src/app/services/popup.service';
import { Media } from '../media-chooser-model/media-chooser-model.component';

export interface ImageCropperConfig {
  base64: string;
  ratio: number;
}
export interface MediaChooserConfig {
  ratio?: string;
  pagination: number;
}
@Component({
  selector: 'media-chooser',
  templateUrl: './media-chooser.component.html',
  styleUrls: ['./media-chooser.component.scss'],
})
export class MediaChooserComponent implements OnInit, OnChanges {
  @ViewChild('wrapper') imageWrapper!: ElementRef;
  @Input('src') media: any = {};
  @Input('title') title = '';
  @Input('editable') editable: boolean = true;
  @Input('config') config: MediaChooserConfig = {
    pagination: 12,
  };
  @Output('output') output = new EventEmitter<Media>();

  constructor(
    public pgService: Utility,
    private popup: PopupService,
    private render: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    try{
      if (this.imageWrapper && changes['media']['currentValue']['path']) {
        this.render.removeClass(this.imageWrapper.nativeElement, 'no-image');
      }
    }catch(e){}
  }

  ngOnInit(): void {}

  showImageChooserModel() {
    this.popup.showMediaChooser(this.config).then((value: Media | null) => {
      if (value) {
        this.output.emit(value);
      }
    });
  }
  onError() {
    console.log('error');
    this.render.addClass(this.imageWrapper.nativeElement, 'no-image');
  }
}
