import { Injectable } from '@angular/core';
import { SparqlResultBinding, RdfTerm } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RealiaService {
  constructor() {}

  /**
   * Add the specified term to the set, if its language is not already
   * present.
   *
   * @param binding The source binding.
   * @param name The property name in the binding.
   * @param set The target set of RdfTerm's.
   * @returns The set.
   */
  public addTerm(
    binding: SparqlResultBinding,
    name: string,
    set?: RdfTerm[]
  ): RdfTerm[] {
    if (!set) {
      set = [];
    }
    if (binding[name]) {
      if (!set.find((t) => t['xml:lang'] === binding[name]['xml:lang'])) {
        set.push(binding[name]);
        return set;
      }
    }
    return set;
  }

  /**
   * Replace the specified term content with that coming from the
   * specified binding, if this has the preferred language.
   *
   * @param binding The source binding.
   * @param name The property name in the binding.
   * @param preferredLang The preferred language ID (e.g. 'en') or null
   * to match either the default language (en) or no language at all.
   * @param term The target term or null.
   * @returns The target term..
   */
  public replaceTerm(
    binding: SparqlResultBinding,
    name: string,
    preferredLang: string | null,
    term: RdfTerm | null
  ): RdfTerm {
    if (!term) {
      term = {
        type: binding[name]?.type || '',
        value: binding[name]?.value || '',
      };
    }
    if (binding[name]) {
      if (
        term['xml:lang'] === preferredLang ||
        (!term['xml:lang'] && !preferredLang)
      ) {
        return term;
      }
      // update term
      term.type = binding[name]?.type;
      term.value = binding[name]?.value;
      term['xml:lang'] = binding['xml:lang']?.value;
      term.datatype = binding[name]?.datatype;
    }
    return term;
  }

  public getIdFromUri(uri: string): string {
    const i = uri.lastIndexOf('/');
    return i > -1 ? uri.substr(i + 1) : uri;
  }

  public getLanguages(terms?: RdfTerm[]): string[] {
    if (!terms) {
      return [];
    }
    return terms.map((t) => t['xml:lang'] || 'en');
  }

  public convertDMSToDD(
    d: number,
    m: number,
    s: number,
    direction: string
  ): number {
    let dd = d + m / 60 + s / (60 * 60);

    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    // don't do anything for N or E
    return dd;
  }
}
