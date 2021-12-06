import { Component, HostListener } from '@angular/core'
import { faCheck } from '@fortawesome/pro-light-svg-icons'
import { enUS } from 'src/locales/locales'
import { DataService } from 'src/app/services/data-service'

@Component({
	selector: 'dav-website-pricing-page',
	templateUrl: './pricing-page.component.html',
	styleUrls: ['./pricing-page.component.scss']
})
export class PricingPageComponent {
	locale = enUS.pricingPage
	pricingLocale = enUS.misc.pricing
	faCheck = faCheck
	mobilePlansTable: boolean = false
	plansTableFontSize: number = 1.15

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().pricingPage
		this.pricingLocale = this.dataService.GetLocale().misc.pricing
	}

	@HostListener('window:resize')
	setSize() {
		this.mobilePlansTable = window.innerWidth < 768
		this.plansTableFontSize = window.innerWidth < 1000 ? 1.05 : 1.15
	}
}