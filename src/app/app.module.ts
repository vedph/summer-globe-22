import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MAPBOX_API_KEY, NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { NgToolsModule } from '@myrmidon/ng-tools';

import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';

import { GlobeComponent } from './components/globe/globe.component';
import { HtmlTextComponent } from './components/html-text/html-text.component';
import { MapComponent } from './components/map/map.component';
import { PersonListComponent } from './components/person-list/person-list.component';
import { PlaceListComponent } from './components/place-list/place-list.component';
import { QueryComponent } from './components/query/query.component';

@NgModule({
  declarations: [
    AppComponent,
    GlobeComponent,
    HtmlTextComponent,
    MapComponent,
    PersonListComponent,
    PlaceListComponent,
    QueryComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // material
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    // vendor
    NgxMapboxGLModule,
    // myrmidon
    NgToolsModule,
  ],
  providers: [
    {
      provide: MAPBOX_API_KEY,
      useValue: environment.mapboxToken,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
