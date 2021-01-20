import { Component } from '@angular/core'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-privacy-page',
	templateUrl: './privacy-page.component.html',
	styleUrls: ["privacy-page.component.scss"]
})
export class PrivacyPageComponent {
	locale = enUS.privacyPage

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().privacyPage
	}
}