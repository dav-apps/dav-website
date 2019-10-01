import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';

// Modules
import { AngularReactBrowserModule } from '@angular-react/core';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
	FabTextFieldModule,
	FabButtonModule,
	FabMessageBarModule,
	FabIconModule
} from '@angular-react/fabric';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxFileHelpersModule } from 'ngx-file-helpers';

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
import { AppsPageComponent } from 'src/app/pages/apps-page/apps-page.component';
import { UserPageComponent } from 'src/app/pages/user-page/user-page.component';

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
		SignupPageComponent,
		AppsPageComponent,
		UserPageComponent
  	],
  	imports: [
		AngularReactBrowserModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
		BrowserAnimationsModule,
		NgbModule,
		FontAwesomeModule,
		FabTextFieldModule,
		FabButtonModule,
		FabMessageBarModule,
		FabIconModule,
		MatSidenavModule,
		MatListModule,
		MatProgressBarModule,
		NgxFileHelpersModule
  	],
  	providers: [
		DataService
	],
  	bootstrap: [AppComponent]
})
export class AppModule { }
