import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { StartPageComponent } from './pages/start-page/start-page.component'
import { ContactPageComponent } from './pages/contact-page/contact-page.component'
import { PrivacyPageComponent } from './pages/privacy-page/privacy-page.component'
import { PocketLibTermsPageComponent } from './pages/pocketlib-terms-page/pocketlib-terms-page.component'
import { PricingPageComponent } from './pages/pricing-page/pricing-page.component'
import { LoginPageComponent } from './pages/login-page/login-page.component'
import { SignupPageComponent } from './pages/signup-page/signup-page.component'
import { AppsPageComponent } from './pages/apps-page/apps-page.component'
import { UserPageComponent } from './pages/user-page/user-page.component'
import { PasswordResetPageComponent } from './pages/password-reset-page/password-reset-page.component'
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component'
import { EmailLinkPageComponent } from './pages/email-link-page/email-link-page.component'
import { DevPageComponent } from './pages/dev-page/dev-page.component'
import { AppPageComponent } from './pages/app-page/app-page.component'
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component'
import { AppStatisticsPageComponent } from './pages/app-statistics-page/app-statistics-page.component'
import { ApiPageComponent } from './pages/api-page/api-page.component'
import { PurchasePageComponent } from './pages/purchase-page/purchase-page.component'

const routes: Routes = [
	{ path: "", component: StartPageComponent },
	{ path: "contact", component: ContactPageComponent },
	{ path: "privacy", component: PrivacyPageComponent },
	{ path: "pocketlib/terms", component: PocketLibTermsPageComponent },
	{ path: "pricing", component: PricingPageComponent },
	{ path: "login", component: LoginPageComponent },
	{ path: "signup", component: SignupPageComponent },
	{ path: "apps", component: AppsPageComponent },
	{ path: "user", component: UserPageComponent },
	{ path: "password-reset", component: PasswordResetPageComponent },
	{ path: "reset-password", component: ResetPasswordPageComponent },
	{ path: "email-link", component: EmailLinkPageComponent },
	{ path: "dev", component: DevPageComponent },
	{ path: "dev/statistics", component: StatisticsPageComponent },
	{ path: "dev/:id", component: AppPageComponent },
	{ path: "dev/:id/statistics", component: AppStatisticsPageComponent },
	{ path: "dev/:id/api/:apiId", component: ApiPageComponent },
	{ path: "purchase/:uuid", component: PurchasePageComponent }
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
