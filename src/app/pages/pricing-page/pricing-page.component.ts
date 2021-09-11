import { Component } from '@angular/core'
import { enUS } from 'src/locales/locales'
import { DataService } from 'src/app/services/data-service'

@Component({
	selector: 'dav-website-pricing-page',
	templateUrl: './pricing-page.component.html'
})
export class PricingPageComponent {
	locale = enUS.pricingPage
	pricingLocale = enUS.misc.pricing

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().pricingPage
		this.pricingLocale = this.dataService.GetLocale().misc.pricing
	}
}