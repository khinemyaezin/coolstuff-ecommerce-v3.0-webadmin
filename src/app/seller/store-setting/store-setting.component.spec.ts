import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSettingComponent } from './store-setting.component';

describe('StoreSettingComponent', () => {
  let component: StoreSettingComponent;
  let fixture: ComponentFixture<StoreSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
