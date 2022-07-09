import { Component, Input, OnInit } from '@angular/core';
import {
  AnyLayout,
  GeoJSONSourceRaw,
  LngLat,
  LngLatBounds,
  Map,
  MapMouseEvent,
  Marker,
  NavigationControl,
} from 'mapbox-gl';
import { GeoMarker } from 'src/app/models';
import {
  Signal,
  SignalId,
  SignalService,
} from 'src/app/services/signal.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  private _rendered?: boolean;
  private _map?: Map;
  private _markers: GeoMarker[] | undefined;

  @Input()
  public get markers(): GeoMarker[] | undefined {
    return this._markers;
  }
  public set markers(value: GeoMarker[] | undefined) {
    this._markers = value;
    this.setFeaturesFromMarkers();
  }

  public resultSource?: GeoJSON.FeatureCollection<GeoJSON.Point>;
  public rawResultSource?: GeoJSONSourceRaw;
  public labelLayout?: AnyLayout;

  constructor(private _signalService: SignalService) {
    // https://stackoverflow.com/questions/62343360/add-text-to-mapbox-marker
    this.labelLayout = {
      'text-field': ['get', 'title'],
      'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      'text-radial-offset': 0.5,
      'text-justify': 'auto',
      'icon-image': ['concat', ['get', 'icon'], '-15'],
    };
  }

  ngOnInit(): void {
    this._signalService.signal$.subscribe((signal) => {
      switch (signal.id) {
        case SignalId.Pick:
          const pt = signal.entity?.point;
          if (pt) {
            this._map?.flyTo({
              // center: [pt.lat, pt.long],
              center: [pt.long, pt.lat],
            });
          }
          break;
      }
    });
  }

  public onMapLoad(map: Map): void {
    this._map = map;
    // navigation
    this._map.addControl(new NavigationControl());
  }

  public onMapClick(event: MapMouseEvent): void {
    if (!this._map || !event.lngLat) {
      return;
    }
    console.log(event.point);
  }

  public onRender(event: any): void {
    // resize to fit container
    // https://github.com/Wykks/ngx-mapbox-gl/issues/344
    if (!this._rendered) {
      event.target.resize();
      this._rendered = true;
    }
  }

  private getRectBounds(points: LngLat[]): LngLatBounds | null {
    // min lng,lat and max lng,lat
    const min = new LngLat(180, 90);
    const max = new LngLat(-180, -90);
    points.forEach((pt) => {
      // min
      if (min.lng > pt.lng) {
        min.lng = pt.lng;
      }
      if (min.lat > pt.lat) {
        min.lat = pt.lat;
      }
      // max
      if (max.lng < pt.lng) {
        max.lng = pt.lng;
      }
      if (max.lat < pt.lat) {
        max.lat = pt.lat;
      }
    });
    return new LngLatBounds(min, max);
  }

  private setFeaturesFromMarkers(): void {
    const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
    if (this.markers?.length) {
      this.markers
        .filter((r) => r.lat)
        .forEach((r) => {
          features.push({
            type: 'Feature',
            properties: {
              id: r.id,
              title: r.name,
            },
            geometry: {
              type: 'Point',
              coordinates: [r.long || 0, r.lat || 0],
            },
          });
        });
    }
    // the markers source
    this.resultSource = {
      type: 'FeatureCollection',
      features: features,
    };
    // the markers labels source
    this.rawResultSource = {
      type: 'geojson',
      data: this.resultSource,
    };
    // fit to markers bounds
    if (this.markers?.length) {
      const pagePoints: LngLat[] = this._markers!.filter((r) => r.lat).map(
        (r) => new LngLat(r.long!, r.lat!)
      ) as LngLat[];
      const bounds = this.getRectBounds(pagePoints);
      if (bounds) {
        this._map?.fitBounds(bounds);
      }
    }
  }
}
