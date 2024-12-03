import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTorneoComponent } from './editar-torneo.component';

describe('EditarTorneoComponent', () => {
  let component: EditarTorneoComponent;
  let fixture: ComponentFixture<EditarTorneoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTorneoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTorneoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
