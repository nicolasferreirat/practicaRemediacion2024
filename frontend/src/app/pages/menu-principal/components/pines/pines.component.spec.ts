import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinesComponent } from './pines.component';

describe('PinesComponent', () => {
  let component: PinesComponent;
  let fixture: ComponentFixture<PinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
