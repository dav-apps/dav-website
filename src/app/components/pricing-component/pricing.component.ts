import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-pricing',
	templateUrl: './pricing.component.html'
})
export class PricingComponent{
	locale = enUS.pricingComponent;

	constructor(
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().pricingComponent;
	}
}