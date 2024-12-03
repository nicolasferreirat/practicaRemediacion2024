import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorneoAmericanoPage } from './torneo-americano.page';

describe('TorneoAmericanoPage', () => {
  let component: TorneoAmericanoPage;
  let fixture: ComponentFixture<TorneoAmericanoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorneoAmericanoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorneoAmericanoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
