import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Entity, GeoMarker } from 'src/app/models';
import { PlaceInfo, PlaceService } from 'src/app/services/place.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { RealiaService } from 'src/app/services/realia.service';
import { AssetService } from 'src/app/services/asset.service';
import { take } from 'rxjs/operators';
import {
  Signal,
  SignalId,
  SignalService,
} from 'src/app/services/signal.service';

@Component({
  selector: 'app-place-list',
  templateUrl: './place-list.component.html',
  styleUrls: ['./place-list.component.css'],
})
export class PlaceListComponent implements OnInit {
  private _marker: GeoMarker | undefined;
  private _entities: Entity[] | undefined;
  private _langMap: Map<string, string> | undefined;

  @Input()
  public get entities(): Entity[] {
    return this._entities || [];
  }
  public set entities(value: Entity[]) {
    this._entities = value;
  }

  @Output()
  public locateEntity: EventEmitter<Entity>;

  public selectedEntity: Entity | undefined;
  public infoExpanded: boolean | undefined;
  public lastQuery: string | undefined;
  public info: PlaceInfo | undefined;

  public languages: string[] | undefined;
  public language: FormControl<string|null>;
  public abstractForm: FormGroup;
  public selectedAbstract: string | undefined;

  public markers: GeoMarker[];
  public busy: boolean | undefined;

  constructor(
    formBuilder: FormBuilder,
    private _placeService: PlaceService,
    private _realiaService: RealiaService,
    private _signalService: SignalService,
    assetService: AssetService
  ) {
    this.locateEntity = new EventEmitter<Entity>();
    assetService
      .loadIsoCodes()
      .pipe(take(1))
      .subscribe((map) => {
        this._langMap = map;
      });
    // abstract form
    this.language = formBuilder.control(null);
    this.abstractForm = formBuilder.group({
      language: this.language,
    });

    this.markers = [];
  }

  ngOnInit(): void {
    // handle signals
    this._signalService.signal$.subscribe((signal) => {
      if (!signal) {
        return;
      }
      switch (signal.id) {
        // select entity to fly to
        case SignalId.Pick:
          if (!signal.entity?.point) {
            return;
          }
          this.selectEntity(signal.entity);
          // automatically locate if has position
          // if (signal.payload.locate && entity.payload.lat) {
          //   this.locate(entity);
          // }
          break;
      }
    });

    this.language.valueChanges.subscribe((_) => {
      if (this.languages && this.info?.abstracts) {
        const i = this.languages.findIndex((l) => {
          return this.language.value === l;
        });
        this.selectedAbstract = this.info.abstracts[i].value;
      }
    });
  }

  public getLangName(code: string): string {
    const name = this._langMap?.get(code);
    return name ? name : code;
  }

  public selectEntity(entity: Entity) {
    if (!this._entities) {
      return;
    }

    this.selectedEntity = entity;
    if (this.info?.uri === entity.uri) {
      this.infoExpanded = true;
      this._marker = undefined;
      return;
    }

    const id = this._realiaService.getIdFromUri(entity.uri);

    this.lastQuery = this._placeService.buildQuery(id);

    this.busy = true;
    this._placeService
      .getInfo(id)
      .pipe(take(1))
      .subscribe(
        (i) => {
          this.busy = false;
          if (!i) {
            return;
          }
          this.info = i;
          this.languages = this._realiaService.getLanguages(i.abstracts);
          this.selectedAbstract = undefined;
          this.infoExpanded = true;
          if (this.languages.length) {
            if (this.languages.find((l) => l === 'en')) {
              this.language.setValue('en');
            } else {
              this.language.setValue(this.languages[0]);
            }
          }

          // markers
          if (this.info.lat && this.info.long) {
            this._marker = {
              id: this.info.uri,
              lat: +this.info.lat.value,
              long: +this.info.long.value,
              name: entity.label,
            };
            if (this._marker) {
              const m = this._marker as GeoMarker;
              this.markers = [m];
            }
          }
        },
        (error) => {
          this.busy = false;
          console.error('Error querying for ' + entity.uri);
          console.error(error);
        }
      );
  }

  public getIdFromUri(uri: string): string {
    return this._realiaService.getIdFromUri(uri);
  }

  public locate(entity: Entity): void {
    this.locateEntity.emit(entity);
  }
}
