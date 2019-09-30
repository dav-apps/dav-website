import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartPageComponent } from './pages/start-page/start-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { PrivacyPageComponent } from './pages/privacy-page/privacy-page.component';
import { PricingPageComponent } from './pages/pricing-page/pricing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { AppsPageComponent } from './pages/apps-page/apps-page.component';
import { UserPageComponent } from './pages/user-page/user-page.component';

const routes: Routes = [
	{ path: "", component: StartPageComponent },
	{ path: "contact", component: ContactPageComponent },
	{ path: "privacy", component: PrivacyPageComponent },
	{ path: "pricing", component: PricingPageComponent },
	{ path: "login", component: LoginPageComponent },
	{ path: "signup", component: SignupPageComponent },
	{ path: "apps", component: AppsPageComponent },
	{ path: "user", component: UserPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule{}
