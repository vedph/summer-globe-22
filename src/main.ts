import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

import { Ion } from 'cesium';
(window as Record<string, any>)['CESIUM_BASE_URL'] = '/assets/cesium/';
Ion.defaultAccessToken = environment.cesiumToken;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
