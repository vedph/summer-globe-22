import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlTextComponent } from './html-text.component';

describe('HtmlTextComponent', () => {
  let component: HtmlTextComponent;
  let fixture: ComponentFixture<HtmlTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HtmlTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
