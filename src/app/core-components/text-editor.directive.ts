import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import Quill from 'quill';

@Directive({
  selector: '[textEditor]'
})
export class TextEditorDirective implements OnInit,AfterViewInit{
  private quillEditor!:Quill;

  @Input('data') public initData!:string|FormControl|AbstractControl<FormControl>;
  @Output('changes') public dataChanges = new EventEmitter();

  constructor(private elementRef:ElementRef, private render:Renderer2) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.quillLoad();
  }
  quillLoad() {
    let Size = Quill.import('attributors/style/size');
    Size.whitelist = ['14px', '16px', '18px'];
    Quill.register(Size, true);
    this.quillEditor = new Quill(this.elementRef?.nativeElement as any, {
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
    this.quillEditor.on('text-change', (delta: any, oldDelta: any, source: any) => {
      if (source == 'user') {
        if(this.initData instanceof FormControl) {
          this.initData.setValue(this.quillEditor?.root.innerHTML);
        }
        this.dataChanges.emit(this.quillEditor?.root.innerHTML);

      }
    });

    if (this.quillEditor?.root.innerHTML !== this.initData) {
      let data;
      if(this.initData instanceof FormControl) {
        data = this.initData.value;
      }else if( typeof this.initData == 'string') {
        data = this.initData;
      }else {
        data = "";
      }
      this.quillEditor?.setContents(this.quillEditor?.clipboard.convert(data), 'silent');
    }

    
  }

}
