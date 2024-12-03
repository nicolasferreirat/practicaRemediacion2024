import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMarcadorPage } from './ver-marcador.page';

describe('VerMarcadorPage', () => {
  let component: VerMarcadorPage;
  let fixture: ComponentFixture<VerMarcadorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMarcadorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMarcadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
