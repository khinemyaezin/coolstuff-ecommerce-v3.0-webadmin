import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent implements OnInit,AfterViewInit {
  @ViewChild('quillEditor') quillEditor?: ElementRef;
  @Input('data') data?: FormControl;
  quill?: Quill = undefined;

  constructor() { }


  ngAfterViewInit(): void {
    this.quillLoad();
  }

  ngOnInit(): void {
    this.data?.valueChanges.subscribe((e) => {
      if (this.quill?.root.innerHTML !== e) {
        this.quill?.setContents(this.quill?.clipboard.convert(e), 'silent');
      }
    });
  }
  quillLoad() {
    let Size = Quill.import('attributors/style/size');
    Size.whitelist = ['14px', '16px', '18px'];
    Quill.register(Size, true);
    this.quill = new Quill(this.quillEditor?.nativeElement as any, {
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      },
      theme: 'snow',
      placeholder: 'Description |',
    });

    //* text change event to import data
    this.quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
      if (source == 'user') {
        this.data?.setValue(this.quill?.root.innerHTML);
      }
    });
  }

}
