import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSetupComponent } from './product-setup.component';

describe('ProductSetupComponent', () => {
  let component: ProductSetupComponent;
  let fixture: ComponentFixture<ProductSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
