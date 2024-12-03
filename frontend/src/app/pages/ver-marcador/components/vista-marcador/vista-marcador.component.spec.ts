import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaMarcadorComponent } from './vista-marcador.component';

describe('VistaMarcadorComponent', () => {
  let component: VistaMarcadorComponent;
  let fixture: ComponentFixture<VistaMarcadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaMarcadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaMarcadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
