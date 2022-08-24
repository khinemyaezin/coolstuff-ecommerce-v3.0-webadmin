import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAdditionalSetupComponent } from './product-additional-setup.component';

describe('ProductAdditionalSetupComponent', () => {
  let component: ProductAdditionalSetupComponent;
  let fixture: ComponentFixture<ProductAdditionalSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductAdditionalSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAdditionalSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
