import { TestBed } from '@angular/core/testing';

import { TorneoSignalService } from './torneo-signal.service';

describe('TorneoSignalService', () => {
  let service: TorneoSignalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TorneoSignalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
