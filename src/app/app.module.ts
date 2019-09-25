import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';

// Modules
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { AppComponent } from './app.component';
import { PricingComponent } from 'src/app/components/pricing-component/pricing.component';

// Pages
import { StartPageComponent } from 'src/app/pages/start-page/start-page.component';
import { ContactPageComponent } from 'src/app/pages/contact-page/contact-page.component';
import { PrivacyPageComponent } from 'src/app/pages/privacy-page/privacy-page.component';
import { PricingPageComponent } from 'src/app/pages/pricing-page/pricing-page.component';
import { LoginPageComponent } from 'src/app/pages/login-page/login-page.component';
import { SignupPageComponent } from 'src/app/pages/signup-page/signup-page.component';

@NgModule({
  	declarations: [
		// Components
		AppComponent,
		PricingComponent,
		// Pages
		StartPageComponent,
		ContactPageComponent,
		PrivacyPageComponent,
		PricingPageComponent,
		LoginPageComponent,
		SignupPageComponent
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
