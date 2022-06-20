import { Component, OnInit } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, take } from 'rxjs';
import { environment } from 'src/environments/environment';

import { Entity, GeoMarker } from './models';
import { AssetService } from './services/asset.service';
import { PlaceInfo, PlaceService } from './services/place.service';
import { SignalId, SignalService } from './services/signal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public cached: boolean;
  public text: string;
  public personEntities: Entity[];
  public placeEntities: Entity[];
  public markers: GeoMarker[];

  constructor(
    private _assetService: AssetService,
    private _placeService: PlaceService,
    private _signalService: SignalService
  ) {
    this.personEntities = [];
    this.placeEntities = [];
    this.markers = [];
    this.cached = environment.cache;
    this.text = '';
  }

  public ngOnInit(): void {
    // load text
    this._assetService
      .loadText('text.html')
      .pipe(take(1))
      .subscribe((t) => {
        this.text = t || '';
        const entities = this._assetService.parseEntities(this.text);
        this.personEntities = entities.filter((e) => e.type === 'a');
        this.placeEntities = entities.filter((e) => e.type === 't');
        this.supplyPositions();
      });
  }

  private setMarkers(): void {
    if (!this.placeEntities?.length) {
      this.markers = [];
      return;
    }
    this.markers = this.placeEntities.map((e) => {
      return {
        id: e.uri,
        lat: e.point?.lat || 0,
        long: e.point?.long || 0,
        name: e.label,
      } as GeoMarker;
    });
  }

  private supplyPositions(): void {
    // https://stackoverflow.com/questions/56517273/with-rxjs-observablearrayt-how-can-i-make-an-http-service-call-for-each-arra
    of(this.placeEntities)
      .pipe(
        switchMap((entities: Entity[]) => {
          const infos$: Observable<PlaceInfo | null>[] = entities.map((e) => {
            const id = e.uri.substring(e.uri.lastIndexOf('/') + 1);
            return this._placeService.getPosition(id);
          });
          return forkJoin(infos$);
        }),
        map((infos) => {
          if (infos && this.placeEntities) {
            for (let i = 0; i < infos.length; i++) {
              this.placeEntities[i].point = {
                lat: +(infos[i]?.lat?.value || 0),
                long: +(infos[i]?.long?.value || 0),
              };
            }
          }
          this.setMarkers();
        })
      )
      .subscribe();
  }

  public onTextEntityPick(entity: Entity): void {
    // text entity (toponym/anthroponym) was clicked:
    // if a toponym was picked, supply its location if any
    if (entity.type === 't') {
      const place = this.placeEntities.find((e) => e.uri === entity.uri);
      if (place) {
        entity.point = place.point;
      }
    }
    // signal entity pick
    this._signalService.emit({
      id: SignalId.Pick,
      entity: entity,
    });
  }

  public onLocateEntity(entity: Entity): void {
    // a place entity was picked from the places list:
    // signal entity pick
    if (entity.point) {
      // map
      this._signalService.emit({
        id: SignalId.Pick,
        entity: entity,
      });
    }
  }
}
