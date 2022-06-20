import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { UrlParamEncodingService } from './url-param-encoding.service';
import { SparqlResult } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DbpediaSparqlService {
  constructor(
    private http: HttpClient,
    private urlParamEncodingService: UrlParamEncodingService
  ) {}

  /**
   * Get SparQL DBPedia Results
   */
  public get(query: string): Observable<SparqlResult> {
    return this.http.get<SparqlResult>(environment.dbpediaUri, {
      params: new HttpParams({
        fromObject: {
          'default-graph-uri': 'http://dbpedia.org',
          query,
          format: 'application/sparql-results+json',
          CXML_redir_for_subjs: '121',
          CXML_redir_for_hrefs: '',
          timeout: '30000',
          debug: 'on',
          run: 'Run Query',
        },
        encoder: this.urlParamEncodingService,
      }),
    });
  }
}
