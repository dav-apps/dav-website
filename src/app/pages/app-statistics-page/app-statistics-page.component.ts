import { Component } from '@angular/core';
import { ApiResponse, ApiErrorResponse, GetAppUsersResponseData } from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';

@Component({
	selector: 'dav-website-app-statistics-page',
	templateUrl: './app-statistics-page.component.html'
})
export class AppStatisticsPageComponent{
	locale = enUS.appStatisticsPage;
	getAppUsersSubscriptionKey: number;

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService
	){
		this.locale = this.dataService.GetLocale().appStatisticsPage;
		this.getAppUsersSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetAppUsers, (response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse) => this.GetAppUsersResponse(response));
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getAppUsersSubscriptionKey);
	}

	GetAppUsersResponse(response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse){
		console.log(response)
	}
}