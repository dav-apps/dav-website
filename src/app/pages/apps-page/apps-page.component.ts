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
	getAllAppsSubscriptionKey: number;
	apps: App[] = [];

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService
	){
		this.locale = this.dataService.GetLocale().appsPage;
	}

	ngOnInit(){
		this.getAllAppsSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetAllApps, (message: (ApiResponse<App[]> | ApiErrorResponse)) => this.GetAllAppsResponse(message));
		this.websocketService.Emit(WebsocketCallbackType.GetAllApps, {});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getAllAppsSubscriptionKey);
	}

	async GetAllAppsResponse(response: (ApiResponse<App[]> | ApiErrorResponse)){
		if(response.status == 200){
			this.apps = (response as ApiResponse<App[]>).data;
		}
	}
}