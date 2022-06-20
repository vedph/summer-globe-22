/**
 * A LOD entity.
 */
export interface Entity {
  type: string;
  uri: string;
  label?: string;
  point?: GeoPoint;
  payload?: any;
}

// https://www.w3.org/TR/2013/REC-sparql11-results-json-20130321/#select-results-form

export interface SparqlResultHead {
  vars: string[];
  link?: string[];
}

export interface RdfTerm {
  type: string;
  value: string;
  'xml:lang'?: string;
  datatype?: string;
}

export interface SparqlResultBinding {
  [key: string]: RdfTerm;
}

export interface SparqlResult {
  head: SparqlResultHead;
  results: {
    bindings: SparqlResultBinding[];
  };
}

export interface GeoPoint {
  lat: number;
  long: number;
  alt?: number;
}

export interface GeoMarker extends GeoPoint {
  id: string;
  name?: string;
  options?: any;
}
