import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';

// Modules
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { AppComponent } from './app.component';
import { StartPageComponent } from 'src/app/pages/start-page/start-page.component';
import { ContactPageComponent } from 'src/app/pages/contact-page/contact-page.component';

@NgModule({
  	declarations: [
		AppComponent,
		StartPageComponent,
		ContactPageComponent
  	],
  	imports: [
		BrowserModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
		NgbModule
  	],
  	providers: [],
  	bootstrap: [AppComponent]
})
export class AppModule { }
