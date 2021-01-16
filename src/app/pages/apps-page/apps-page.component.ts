import { Component } from '@angular/core'
import { ApiResponse, App, AppsController } from 'dav-npm'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-apps-page',
	templateUrl: './apps-page.component.html'
})
export class AppsPageComponent {
	locale = enUS.appsPage
	apps: App[] = []

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().appsPage
	}

	async ngOnInit() {
		this.apps = (await AppsController.GetApps() as ApiResponse<App[]>).data
	}
}