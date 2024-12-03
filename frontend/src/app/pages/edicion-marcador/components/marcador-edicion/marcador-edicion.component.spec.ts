import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcadorEdicionComponent } from './marcador-edicion.component';

describe('MarcadorEdicionComponent', () => {
  let component: MarcadorEdicionComponent;
  let fixture: ComponentFixture<MarcadorEdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcadorEdicionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcadorEdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
