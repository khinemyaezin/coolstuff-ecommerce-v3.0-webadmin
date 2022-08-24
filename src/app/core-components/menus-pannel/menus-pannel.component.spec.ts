import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusPannelComponent } from './menus-pannel.component';

describe('MenusPannelComponent', () => {
  let component: MenusPannelComponent;
  let fixture: ComponentFixture<MenusPannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenusPannelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusPannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
