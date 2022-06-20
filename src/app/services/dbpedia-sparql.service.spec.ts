import { TestBed } from '@angular/core/testing';

import { DbpediaSparqlService } from './dbpedia-sparql.service';

describe('DbpediaSparqlService', () => {
  let service: DbpediaSparqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbpediaSparqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
