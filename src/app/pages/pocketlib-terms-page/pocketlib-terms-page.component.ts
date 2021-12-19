import { Component } from '@angular/core'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-pocketlib-terms',
	templateUrl: './pocketlib-terms-page.component.html',
	styleUrls: ["pocketlib-terms-page.component.scss"]
})
export class PocketLibTermsPageComponent{
	locale = enUS.pocketlibTermsPage

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().pocketlibTermsPage
		this.dataService.showNavbar = true
		this.dataService.showFooter = true
	}
}