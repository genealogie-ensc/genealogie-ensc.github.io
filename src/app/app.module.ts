import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgxGraphModule } from '@swimlane/ngx-graph';
import { API_KEY, GoogleSheetsDbService } from 'ng-google-sheets-db';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NgxGraphModule, HttpClientModule],
  providers: [
    {
      provide: API_KEY,
      useValue: 'AIzaSyCr92YBtcleWmayijkhhmHb2RCWgT_n_oU',
    },
    GoogleSheetsDbService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
