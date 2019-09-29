import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';

// Modules
import { AngularReactBrowserModule } from '@angular-react/core';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { 
	FabTextFieldModule,
	FabButtonModule,
	FabMessageBarModule,
	FabIconModule
} from '@angular-react/fabric';

// Services
import { DataService } from './services/data-service';

// Components
import { AppComponent } from './app.component';
import { PricingComponent } from 'src/app/components/pricing-component/pricing.component';
import { AppCardComponent } from 'src/app/components/app-card-component/app-card.component';

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
		AppCardComponent,
		// Pages
		StartPageComponent,
		ContactPageComponent,
		PrivacyPageComponent,
		PricingPageComponent,
		LoginPageComponent,
		SignupPageComponent
  	],
  	imports: [
		AngularReactBrowserModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
		NgbModule,
		FabTextFieldModule,
		FabButtonModule,
		FabMessageBarModule,
		FabIconModule
  	],
  	providers: [
		DataService
	],
  	bootstrap: [AppComponent]
})
export class AppModule { }
