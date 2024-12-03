import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerUsuarioPage } from './ver-usuario.page';

describe('VerUsuarioPage', () => {
  let component: VerUsuarioPage;
  let fixture: ComponentFixture<VerUsuarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerUsuarioPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
