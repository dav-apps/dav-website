import { Component } from '@angular/core';
import { ApiResponse, ApiErrorResponse, GetUsersResponseData } from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';

@Component({
	selector: 'dav-website-statistics-page',
	templateUrl: './statistics-page.component.html'
})
export class StatisticsPageComponent{
	locale = enUS.statisticsPage;
	getUsersSubscriptionKey: number;

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService
	){
		this.locale = this.dataService.GetLocale().statisticsPage;
		this.getUsersSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetUsers, (response: ApiResponse<GetUsersResponseData> | ApiErrorResponse) => this.GetUsersResponse(response));
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getUsersSubscriptionKey);
	}

	GetUsersResponse(message: ApiResponse<GetUsersResponseData> | ApiErrorResponse){
		console.log(message)
	}
}