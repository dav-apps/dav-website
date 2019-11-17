import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, GetAppUsersResponseData, App } from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';

@Component({
	selector: 'dav-website-app-statistics-page',
	templateUrl: './app-statistics-page.component.html'
})
export class AppStatisticsPageComponent{
	locale = enUS.appStatisticsPage;
	getAppSubscriptionKey: number;
	getAppUsersSubscriptionKey: number;
	app: App = new App(0, "", "", false, null, null, null);

	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().appStatisticsPage;

		this.getAppSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetApp, (response: ApiResponse<App> | ApiErrorResponse) => this.GetAppResponse(response));
		this.getAppUsersSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetAppUsers, (response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse) => this.GetAppUsersResponse(response));
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}

		let appId = +this.activatedRoute.snapshot.paramMap.get('id');

		this.websocketService.Emit(WebsocketCallbackType.GetApp, {
			jwt: this.dataService.user.JWT,
			id: appId
		})

		this.websocketService.Emit(WebsocketCallbackType.GetAppUsers, {
			jwt: this.dataService.user.JWT,
			id: appId
		})
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getAppUsersSubscriptionKey);
	}

	GoBack(){
		this.router.navigate(['dev', this.app.Id]);
	}

	GetAppResponse(response: ApiResponse<App> | ApiErrorResponse){
		if(response.status == 200){
			this.app = (response as ApiResponse<App>).data;
		}else{
			// Redirect to the Dev page
			this.router.navigate(['dev']);
		}
	}

	GetAppUsersResponse(response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse){
		if(response.status == 200){

		}else{
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id]);
		}
	}
}