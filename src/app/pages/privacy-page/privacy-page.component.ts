import { Component } from '@angular/core';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-privacy-page',
	templateUrl: './privacy-page.component.html'
})
export class PrivacyPageComponent{
	locale = enUS.privacyPage;

	constructor(
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().privacyPage;
	}
}