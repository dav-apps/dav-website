import { Component } from '@angular/core';
import { ApiResponse, ApiErrorResponse, App } from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';

@Component({
	selector: 'dav-website-apps-page',
	templateUrl: './apps-page.component.html'
})
export class AppsPageComponent{
	locale = enUS.appsPage;
	apps: App[] = [];

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService
	){
		this.locale = this.dataService.GetLocale().appsPage;
	}

	async ngOnInit(){
		let response: ApiResponse<App[]> | ApiErrorResponse = await this.websocketService.Emit(WebsocketCallbackType.GetAllApps, {});
		if(response.status == 200){
			this.apps = (response as ApiResponse<App[]>).data;
		}
	}
}