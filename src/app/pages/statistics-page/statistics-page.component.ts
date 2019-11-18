import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import * as moment from 'moment';
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
	userChartDataSets: ChartDataSets[] = [{data: [], label: this.locale.numberOfUsers}];
	userChartLabels: Label[] = [];
	plansChartData: number[] = [0, 0, 0];
	plansChartLabels: Label[] = ["Free", "Plus", "Pro"];
	confirmationsChartData: number[] = [0, 0];
	confirmationsChartLabels: Label[] = [this.locale.confirmed, this.locale.unconfirmed];

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
		moment.locale(this.dataService.locale);
		this.getUsersSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetUsers, (response: ApiResponse<GetUsersResponseData> | ApiErrorResponse) => this.GetUsersResponse(response));

		// Set the labels
		this.userChartDataSets[0].label = this.locale.numberOfUsers;
		this.confirmationsChartLabels[0] = this.locale.confirmed;
		this.confirmationsChartLabels[1] = this.locale.unconfirmed;
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}

		this.websocketService.Emit(WebsocketCallbackType.GetUsers, {
			jwt: this.dataService.user.JWT
		})
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getUsersSubscriptionKey);
	}

	ProcessData(users: GetUsersResponseData){
		let start = moment().startOf('month').subtract(5, 'months');
		let months: Map<string, number> = new Map();
		this.plansChartData = [0, 0, 0];
		this.confirmationsChartData = [0, 0];

		// Get the last 6 months
		for(let i = 0; i < 6; i++){
			months.set(start.format('MMMM YYYY'), 0);
			start.add(1, 'month');
		}

		for(let user of users.users){
			// Add the cumulative user counts
			let createdAt = moment(user.createdAt).startOf('month');
			let createdMonth = createdAt.format('MMMM YYYY');

			let createdMonthFound: boolean = false;
			for(let month of months.entries()){
				if(createdMonthFound){
					months.set(month[0], month[1] + 1);
				}else if(createdMonth == month[0]){
					createdMonthFound = true;
					months.set(month[0], month[1] + 1);
				}
			}

			// Count the plan
			this.plansChartData[user.plan]++

			// Count the email confirmation
			this.confirmationsChartData[user.confirmed ? 0 : 1]++
		}

		// Show the number of users
		this.userChartDataSets[0].data = [];
		this.userChartLabels = [];
		for(let month of months.entries()){
			this.userChartLabels.push(month[0]);
			this.userChartDataSets[0].data.push(month[1]);
		}
	}

	GetUsersResponse(response: ApiResponse<GetUsersResponseData> | ApiErrorResponse){
		if(response.status == 200){
			this.ProcessData((response as ApiResponse<GetUsersResponseData>).data);
		}else{
			// Redirect to the Dev page
			this.router.navigate(['dev']);
		}
	}

	GoBack(){
		this.router.navigate(['dev']);
	}
}