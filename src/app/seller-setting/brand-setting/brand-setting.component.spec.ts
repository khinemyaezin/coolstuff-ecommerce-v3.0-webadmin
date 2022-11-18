import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandSettingComponent } from './brand-setting.component';

describe('BrandSettingComponent', () => {
  let component: BrandSettingComponent;
  let fixture: ComponentFixture<BrandSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
