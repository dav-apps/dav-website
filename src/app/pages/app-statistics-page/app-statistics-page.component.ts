import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import * as moment from 'moment';
import { ApiResponse, ApiErrorResponse, GetAppUsersResponseData, GetActiveAppUsersResponseData, App } from 'dav-npm';
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
	getActiveAppUsersSubscriptionKey: number;
	app: App = new App(0, "", "", false, null, null, null);
	userChartDataSets: ChartDataSets[] = [{data: [], label: this.locale.numberOfUsers}];
	userChartLabels: Label[] = [];

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
		moment.locale(this.dataService.locale);
		this.getAppSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetApp, (response: ApiResponse<App> | ApiErrorResponse) => this.GetAppResponse(response));
		this.getAppUsersSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetAppUsers, (response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse) => this.GetAppUsersResponse(response));
		this.getActiveAppUsersSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetActiveAppUsers, (response: ApiResponse<GetActiveAppUsersResponseData> | ApiErrorResponse) => this.GetActiveAppUsersResponse(response));

		// Set the labels
		this.userChartDataSets[0].label = this.locale.numberOfUsers;
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

		this.websocketService.Emit(WebsocketCallbackType.GetActiveAppUsers, {
			jwt: this.dataService.user.JWT,
			id: appId
		})
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getAppSubscriptionKey,
			this.getAppUsersSubscriptionKey,
			this.getActiveAppUsersSubscriptionKey
		)
	}

	ProcessUsers(users: GetAppUsersResponseData){
		let start = moment().startOf('month').subtract(5, 'months');
		let months: Map<string, number> = new Map();

		// Get the last 6 months
		for(let i = 0; i < 6; i++){
			months.set(start.format('MMMM YYYY'), 0);
			start.add(1, 'month');
		}

		for(let user of users.users){
			// Add the cumulative user count
			let startedUsing = moment(user.startedUsing).startOf('month');
			let startedUsingMonth = startedUsing.format('MMMM YYYY');

			let startedUsingMonthFound: boolean = false;
			for(let month of months.entries()){
				if(startedUsingMonthFound){
					months.set(month[0], month[1] + 1);
				}else if(startedUsingMonth == month[0]){
					startedUsingMonthFound = true;
					months.set(month[0], month[1] + 1);
				}
			}
		}

		this.userChartDataSets[0].data = [];
		this.userChartLabels = [];
		for(let month of months.entries()){
			this.userChartLabels.push(month[0]);
			this.userChartDataSets[0].data.push(month[1]);
		}
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
			this.ProcessUsers((response as ApiResponse<GetAppUsersResponseData>).data);
		}else{
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id]);
		}
	}

	GetActiveAppUsersResponse(response: ApiResponse<GetActiveAppUsersResponseData> | ApiErrorResponse){
		if(response.status == 200){
			console.log(response)
		}else{
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id]);
		}
	}
}