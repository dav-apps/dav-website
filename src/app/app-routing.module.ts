import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartPageComponent } from './pages/start-page/start-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { PrivacyPageComponent } from './pages/privacy-page/privacy-page.component';

const routes: Routes = [
	{ path: "", component: StartPageComponent },
	{ path: "contact", component: ContactPageComponent },
	{ path: "privacy", component: PrivacyPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule{}
