import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaChooserComponent } from './media-chooser.component';

describe('MediaChooserComponent', () => {
  let component: MediaChooserComponent;
  let fixture: ComponentFixture<MediaChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaChooserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
