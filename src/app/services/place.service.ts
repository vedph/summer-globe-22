import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ErrorService } from '@myrmidon/ng-tools';

import { RdfTerm, SparqlResult } from '../models';
import { DbpediaSparqlService } from './dbpedia-sparql.service';
import { LocalCacheService } from './local-cache.service';
import { RealiaService } from './realia.service';

const CACHE_ID = 'globe-places';
const POS_PREFIX = 'pos.';

export interface PlaceInfo {
  uri: string;
  labels: RdfTerm[];
  abstracts?: RdfTerm[];
  depiction?: RdfTerm;
  topic?: RdfTerm;
  lat?: RdfTerm;
  long?: RdfTerm;
}

@Injectable({
  providedIn: 'root',
})
export class PlaceService {
  constructor(
    private _dbpService: DbpediaSparqlService,
    private _cacheService: LocalCacheService,
    private _errorService: ErrorService,
    private _realiaService: RealiaService
  ) {}

  public buildQuery(id: string): string {
    return `PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    SELECT DISTINCT
      dbr:${id} as ?place ?label
      ?topic ?depiction ?abstract
      ?lat ?long
    WHERE {
      dbr:${id} rdfs:label ?label.
      OPTIONAL {
        dbr:${id} geo:lat ?lat;
        geo:long ?long.
      }
      OPTIONAL {
        dbr:${id} foaf:isPrimaryTopicOf ?topic.
      }
      OPTIONAL {
        dbr:${id} foaf:depiction ?depiction.
      }
      OPTIONAL {
        dbr:${id} dbo:abstract ?abstract.
      }
    }`;
  }

  public buildPosQuery(id: string): string {
    return `PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    SELECT DISTINCT dbr:${id} as ?place ?lat ?long
    WHERE {
      dbr:${id} geo:lat ?lat;
        geo:long ?long.
    }`;
  }

  public buildInfo(result: SparqlResult): PlaceInfo | null {
    if (!result) {
      return null;
    }
    const bindings = result.results.bindings;
    const info: PlaceInfo = {
      uri: '',
      labels: [],
    };
    for (const binding of bindings) {
      // place (just once)
      if (!info.uri) {
        info.uri = binding['place'].value;
      }

      // labels
      info.labels = this._realiaService.addTerm(binding, 'label', info.labels);

      // abstract
      info.abstracts = this._realiaService.addTerm(
        binding,
        'abstract',
        info.abstracts
      );

      // depiction
      info.depiction = this._realiaService.replaceTerm(
        binding,
        'depiction',
        null,
        info.depiction || null
      );

      // topic
      info.topic = this._realiaService.replaceTerm(
        binding,
        'topic',
        null,
        info.topic || null
      );

      // lat
      info.lat = this._realiaService.replaceTerm(
        binding,
        'lat',
        null,
        info.lat || null
      );

      // long
      info.long = this._realiaService.replaceTerm(
        binding,
        'long',
        null,
        info.long || null
      );
    }
    return info;
  }

  public getInfo(id: string): Observable<PlaceInfo | null> {
    const cached = this._cacheService.get<SparqlResult>(CACHE_ID, id);
    if (cached) {
      return of(this.buildInfo(cached));
    }

    const query = this.buildQuery(id);
    return this._dbpService.get(query).pipe(
      catchError(this._errorService.handleError),
      map((r: SparqlResult) => {
        this._cacheService.add(CACHE_ID, id, r);
        return this.buildInfo(r);
      })
    );
  }

  public buildPosInfo(result: SparqlResult): PlaceInfo | null {
    if (!result) {
      return null;
    }
    const bindings = result.results.bindings;
    const info: PlaceInfo = {
      uri: '',
      labels: [],
    };
    for (const binding of bindings) {
      // place (just once)
      if (!info.uri) {
        info.uri = binding['place'].value;
      }

      // lat
      info.lat = this._realiaService.replaceTerm(
        binding,
        'lat',
        null,
        info.lat || null
      );

      // long
      info.long = this._realiaService.replaceTerm(
        binding,
        'long',
        null,
        info.long || null
      );
      if (info.lat.value && info.long.value) {
        break;
      }
    }
    return info;
  }

  public getPosition(id: string): Observable<PlaceInfo | null> {
    const cached = this._cacheService.get<SparqlResult>(
      CACHE_ID,
      POS_PREFIX + id
    );
    if (cached) {
      return of(this.buildPosInfo(cached));
    }

    const query = this.buildPosQuery(id);
    return this._dbpService.get(query).pipe(
      catchError(this._errorService.handleError),
      map((r: SparqlResult) => {
        this._cacheService.add(CACHE_ID, POS_PREFIX + id, r);
        return this.buildInfo(r);
      })
    );
  }
}
