import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialAmericanoComponent } from './historial-americano.component';

describe('HistorialAmericanoComponent', () => {
  let component: HistorialAmericanoComponent;
  let fixture: ComponentFixture<HistorialAmericanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialAmericanoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialAmericanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
