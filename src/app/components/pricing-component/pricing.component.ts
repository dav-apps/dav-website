import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-pricing',
	templateUrl: './pricing.component.html'
})
export class PricingComponent{
	constructor(
		public dataService: DataService
	){}
}