import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Entity } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(private _http: HttpClient) {}

  /**
   * Load the text with the specified name from the assets folder.
   * @param name The asset name.
   */
  public loadText(name: string): Observable<string> {
    return this._http.get(`./assets/${name}`, {
      responseType: 'text',
    });
  }

  /**
   * Build an HTML element from the specified HTML code.
   * @param html The HTML code.
   */
  public htmlToElement(html: string): HTMLElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body;
  }

  /**
   * Load an HTML document from the assets folder.
   * @param name The asset name.
   */
  public loadHtmlElement(name: string): Observable<HTMLElement> {
    return this.loadText(name).pipe(
      take(1),
      map((html) => {
        return this.htmlToElement(html);
      })
    );
  }

  /**
   * Parse the entities found in the specified HTML document's
   * anchors.
   */
  public parseEntities(html: string): Entity[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const entities: Entity[] = [];
    const r = new RegExp('^([at]):(http.+)$');

    doc.body.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href) {
        const m = r.exec(href);
        if (m) {
          entities.push({
            type: m[1],
            uri: m[2],
            label: a.text?.trim(),
          });
        }
      }
    });

    return entities;
  }

  /**
   * Load a set of entities from the assets folder.
   * @param name The asset name.
   */
  public loadEntities(name: string): Observable<Entity[]> {
    return this.loadText(name).pipe(
      take(1),
      map((json) => {
        return JSON.parse(json);
      })
    );
  }

  /**
   * Load the list of ISO639-1 (2-letters) codes from assets.
   * @returns A map with key=code and value=name.
   */
  public loadIsoCodes(): Observable<Map<string, string>> {
    return this.loadText('iso639.csv').pipe(
      take(1),
      map((csv) => {
        const map = new Map<string, string>();
        let j: number,
          i = 0;
        while ((j = csv.indexOf('\n', i)) !== -1) {
          const line = csv.substring(i, j);
          const cols = line.split(',');
          map.set(cols[0], cols[1]);
          i = j + 1;
        }
        return map;
      })
    );
  }
}
