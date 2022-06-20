import { TestBed } from '@angular/core/testing';

import { RealiaService } from './realia.service';

describe('RealiaService', () => {
  let service: RealiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
