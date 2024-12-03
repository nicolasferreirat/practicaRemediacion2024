import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionMarcadorPage } from './edicion-marcador.page';

describe('EdicionMarcadorPage', () => {
  let component: EdicionMarcadorPage;
  let fixture: ComponentFixture<EdicionMarcadorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicionMarcadorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdicionMarcadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
