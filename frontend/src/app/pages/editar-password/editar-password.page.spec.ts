import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPasswordPage } from './editar-password.page';

describe('EditarPasswordPage', () => {
  let component: EditarPasswordPage;
  let fixture: ComponentFixture<EditarPasswordPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPasswordPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
