import { TestBed } from '@angular/core/testing';

import { UrlParamEncodingService } from './url-param-encoding.service';

describe('UrlParamEncodingService', () => {
  let service: UrlParamEncodingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlParamEncodingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
