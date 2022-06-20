import { Component, ElementRef, Input, OnInit } from '@angular/core';
import {
  Cartesian2,
  Cartesian3,
  Color,
  Entity,
  VerticalOrigin,
  Viewer,
} from 'cesium';
import { GeoMarker } from 'src/app/models';
import { SignalId, SignalService } from 'src/app/services/signal.service';

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css'],
})
export class GlobeComponent implements OnInit {
  private _viewer?: Viewer;
  private _markers: GeoMarker[] | undefined;

  @Input()
  public get markers(): GeoMarker[] | undefined {
    return this._markers;
  }
  public set markers(value: GeoMarker[] | undefined) {
    this._markers = value;
    this.setEntities();
  }

  constructor(private el: ElementRef, private _signalService: SignalService) {}

  ngOnInit(): void {
    this._viewer = new Viewer(this.el.nativeElement);

    this._signalService.signal$.subscribe((signal) => {
      if (!this._viewer) {
        return;
      }
      switch (signal.id) {
        case SignalId.Pick:
          if (signal.entity?.uri) {
            const e = this._viewer.entities.getById(signal.entity.uri);
            if (e) {
              this._viewer.flyTo(e);
            }
          }
          break;
      }
    });
  }

  private setEntities(): void {
    if (!this._viewer) {
      return;
    }
    this._viewer.entities.removeAll();
    if (!this._markers?.length) {
      return;
    }
    for (let i = 0; i < this._markers.length; i++) {
      const marker = this._markers[i];
      this._viewer.entities.add({
        id: marker.id,
        name: marker.name,
        // https://cesium.com/learn/cesiumjs/ref-doc/LabelGraphics.html
        label: {
          text: marker.name,
          font: '20px sans-serif',
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -9),
        },
        position: Cartesian3.fromDegrees(marker.long, marker.lat),
        point: {
          pixelSize: 10,
          color: Color.ORANGE,
        },
      });
    }
    this._viewer.zoomTo(this._viewer.entities);
  }
}
