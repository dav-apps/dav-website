import { BrowserModule } from '@angular/platform-browser'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { environment } from '../environments/environment'

// Modules
import { AppRoutingModule } from './app-routing.module'
import { ServiceWorkerModule } from '@angular/service-worker'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatButtonModule } from '@angular/material/button'
import { NgxFileHelpersModule } from 'ngx-file-helpers'
import { ChartsModule } from 'ng2-charts'

// Services
import { DataService } from './services/data-service'
import { WebsocketService } from './services/websocket-service'

// Components
import { AppComponent } from './app.component'
import { AppCardComponent } from 'src/app/components/app-card-component/app-card.component'
import { PaymentFormComponent } from 'src/app/components/payment-form-component/payment-form.component'
import { BankAccountFormComponent } from 'src/app/components/bank-account-form-component/bank-account-form.component'

// Pages
import { StartPageComponent } from 'src/app/pages/start-page/start-page.component'
import { ContactPageComponent } from 'src/app/pages/contact-page/contact-page.component'
import { PrivacyPageComponent } from 'src/app/pages/privacy-page/privacy-page.component'
import { PocketLibTermsPageComponent } from 'src/app/pages/pocketlib-terms-page/pocketlib-terms-page.component'
import { PricingPageComponent } from 'src/app/pages/pricing-page/pricing-page.component'
import { LoginPageComponent } from 'src/app/pages/login-page/login-page.component'
import { SignupPageComponent } from 'src/app/pages/signup-page/signup-page.component'
import { AppsPageComponent } from 'src/app/pages/apps-page/apps-page.component'
import { UserPageComponent } from 'src/app/pages/user-page/user-page.component'
import { PasswordResetPageComponent } from 'src/app/pages/password-reset-page/password-reset-page.component'
import { ResetPasswordPageComponent } from 'src/app/pages/reset-password-page/reset-password-page.component'
import { EmailLinkPageComponent } from 'src/app/pages/email-link-page/email-link-page.component'
import { DevPageComponent } from 'src/app/pages/dev-page/dev-page.component'
import { AppPageComponent } from 'src/app/pages/app-page/app-page.component'
import { StatisticsPageComponent } from 'src/app/pages/statistics-page/statistics-page.component'
import { AppStatisticsPageComponent } from 'src/app/pages/app-statistics-page/app-statistics-page.component'
import { ApiPageComponent } from 'src/app/pages/api-page/api-page.component'
import { PurchasePageComponent } from 'src/app/pages/purchase-page/purchase-page.component'

@NgModule({
  	declarations: [
		// Components
		AppComponent,
		AppCardComponent,
		PaymentFormComponent,
		BankAccountFormComponent,
		// Pages
		StartPageComponent,
		ContactPageComponent,
		PrivacyPageComponent,
		PocketLibTermsPageComponent,
		PricingPageComponent,
		LoginPageComponent,
		SignupPageComponent,
		AppsPageComponent,
		UserPageComponent,
		PasswordResetPageComponent,
		ResetPasswordPageComponent,
		EmailLinkPageComponent,
		DevPageComponent,
		AppPageComponent,
		StatisticsPageComponent,
		AppStatisticsPageComponent,
		ApiPageComponent,
		PurchasePageComponent
  	],
  	imports: [
		BrowserModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
		BrowserAnimationsModule,
		NgbModule,
		FontAwesomeModule,
		MatSidenavModule,
		MatListModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatButtonModule,
		NgxFileHelpersModule,
		ChartsModule
  	],
  	providers: [
		DataService,
		WebsocketService
	],
	bootstrap: [AppComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
