import { Component } from '@angular/core'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-contact-page',
	templateUrl: './contact-page.component.html'
})
export class ContactPageComponent {
	locale = enUS.contactPage

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().contactPage
	}
}