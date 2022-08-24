import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCropperModelComponent } from './image-cropper-model.component';

describe('ImageCropperModelComponent', () => {
  let component: ImageCropperModelComponent;
  let fixture: ComponentFixture<ImageCropperModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageCropperModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCropperModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
