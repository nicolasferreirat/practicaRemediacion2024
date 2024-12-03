import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerTorneoComponent } from './ver-torneo.component';

describe('VerTorneoComponent', () => {
  let component: VerTorneoComponent;
  let fixture: ComponentFixture<VerTorneoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerTorneoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerTorneoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
