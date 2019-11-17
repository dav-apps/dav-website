import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
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

	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router
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

	GoBack(){
		this.router.navigate(['dev']);
	}
}