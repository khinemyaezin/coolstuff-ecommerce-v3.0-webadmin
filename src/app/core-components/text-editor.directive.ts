import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import Quill from 'quill';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';

@Directive({
  selector: '[textEditor]',
})
export class TextEditorDirective implements OnInit, AfterViewInit,OnChanges {
  private quillEditor!: Quill;

  @Input('data') public initData!: string;
  @Output('changes') public dataChanges = new EventEmitter();

  constructor(private elementRef: ElementRef, private render: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.quillEditor?.root.innerHTML !== this.initData) {
      this.quillEditor?.setContents(this.quillEditor?.clipboard.convert(this.initData), 'silent');
    }
  }

  ngAfterViewInit(): void {}

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

    this.quillEditor?.setContents(
      this.quillEditor?.clipboard.convert(this.initData),
      'silent'
    );

    //* text change event to import data
    const obs$ = new Observable( subscriber=> {
      this.quillEditor.on('text-change',
      (delta: any, oldDelta: any, source: any) => 
        subscriber.next({delta, oldDelta, source})
      )
    });
    // this.quillEditor.on(
    //   'text-change',
    //   (delta: any, oldDelta: any, source: any) => {
    //     if (source == 'user') {
    //       this.dataChanges.emit(this.quillEditor?.root.innerHTML);
    //     }
    //   }
    // );
    obs$.pipe(debounceTime(500),distinctUntilChanged(),map( (v:any)=> v )).subscribe(
      (value)=> {
        if (value.source == 'user') {
          this.dataChanges.emit(this.quillEditor?.root.innerHTML);
        }
        
      }
    )
  }
}
