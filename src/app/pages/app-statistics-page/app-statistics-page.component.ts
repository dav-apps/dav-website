import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import * as moment from 'moment';
import {
	ApiResponse,
	ApiErrorResponse,
	GetAppUsers,
	GetAppUsersResponseData,
	GetApp,
	App,
	GetActiveAppUsers,
	GetActiveAppUsersResponseData
} from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-app-statistics-page',
	templateUrl: './app-statistics-page.component.html'
})
export class AppStatisticsPageComponent{
	locale = enUS.appStatisticsPage;
	app: App = new App(0, "", "", false, null, null, null);
	userChartDataSets: ChartDataSets[] = [{data: [], label: this.locale.numberOfUsers}];
	userChartLabels: Label[] = [];
	activeUsersChartDataSets: ChartDataSets[] = [
		{data: [], label: this.locale.daily},
		{data: [], label: this.locale.monthly},
		{data: [], label: this.locale.yearly}
	]
	activeUsersChartLabels: Label[] = [];
	currentlyActiveUsersDataSets: ChartDataSets[] = [{data: [], label: this.locale.currentlyActiveUsers}];
	currentlyActiveUsersChartLabels: Label[] = [this.locale.daily, this.locale.monthly, this.locale.yearly];
	totalUsersText: string = this.locale.totalUsers.replace('{0}', '0');

	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().appStatisticsPage;
		moment.locale(this.dataService.locale);

		// Set the labels
		this.userChartDataSets[0].label = this.locale.numberOfUsers;
		this.activeUsersChartDataSets[0].label = this.locale.daily;
		this.activeUsersChartDataSets[1].label = this.locale.monthly;
		this.activeUsersChartDataSets[2].label = this.locale.yearly;
		this.currentlyActiveUsersDataSets[0].label = this.locale.currentlyActiveUsers;
		this.currentlyActiveUsersChartLabels[0] = this.locale.daily;
		this.currentlyActiveUsersChartLabels[1] = this.locale.monthly;
		this.currentlyActiveUsersChartLabels[2] = this.locale.yearly;
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}else if(!this.dataService.user.Dev){
			this.dataService.startPageErrorMessage = this.locale.accessNotAllowedMessage;
			this.router.navigate(['/']);
			return;
		}

		let appId = +this.activatedRoute.snapshot.paramMap.get('id');

		await this.LoadApp(appId);
		await this.LoadAppUsers(appId);
		await this.LoadActiveAppUsers(appId);
	}

	async LoadApp(appId: number){
		let response: ApiResponse<App> | ApiErrorResponse = await GetApp(this.dataService.user.JWT, appId);

		if(response.status == 200){
			this.app = (response as ApiResponse<App>).data;
		}else{
			// Redirect to the Dev page
			this.router.navigate(['dev']);
		}
	}

	async LoadAppUsers(appId: number){
		let response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse = await GetAppUsers(this.dataService.user.JWT, appId);

		if(response.status == 200){
			this.ProcessUsers((response as ApiResponse<GetAppUsersResponseData>).data);
		}else{
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id]);
		}
	}

	async LoadActiveAppUsers(appId: number){
		let response: ApiResponse<GetActiveAppUsersResponseData> | ApiErrorResponse = await GetActiveAppUsers(this.dataService.user.JWT, appId);

		if(response.status == 200){
			this.ProcessActiveUsers((response as ApiResponse<GetActiveAppUsersResponseData>).data);
		}else{
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id]);
		}
	}

	ProcessUsers(users: GetAppUsersResponseData){
		// Set the total users
		this.totalUsersText = this.locale.totalUsers.replace('{0}', users.users.length.toString());

		let currentDate = moment().startOf('month').subtract(5, 'months');
		let start = currentDate.clone();
		let months: Map<string, number> = new Map();

		// Get the last 6 months
		for(let i = 0; i < 6; i++){
			months.set(currentDate.format('MMMM YYYY'), 0);
			currentDate.add(1, 'month');
		}

		for(let user of users.users){
			// Add the cumulative user count
			let startedUsing = moment(user.startedUsing).startOf('month');
			let startedUsingMonth = startedUsing.format('MMMM YYYY');
			let startedUsingBeforeStart: boolean = startedUsing.isBefore(start);

			let startedUsingMonthFound: boolean = false;
			for(let month of months.entries()){
				if(startedUsingMonthFound || startedUsingBeforeStart){
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

	ProcessActiveUsers(activeUsers: GetActiveAppUsersResponseData){
		// Save the days in a separate array with timestamps
		let days: {timestamp: number, daily: number, monthly: number, yearly: number}[] = [];
		for(let day of activeUsers.days){
			let timestamp = moment(day.time).subtract(1, 'day').unix();
			days.push({
				timestamp, 
				daily: day.countDaily,
				monthly: day.countMonthly,
				yearly: day.countYearly
			})
		}

		// Sort the days by time
		days.sort((a, b) => {
			if(a.timestamp > b.timestamp){
				return 1
			}else if(a.timestamp < b.timestamp){
				return -1
			}else{
				return 0
			}
		});

		// Show the days on the active users line chart
		this.activeUsersChartDataSets[0].data = [];
		this.activeUsersChartDataSets[1].data = [];
		this.activeUsersChartDataSets[2].data = [];

		for(let day of days){
			this.activeUsersChartDataSets[0].data.push(day.daily);
			this.activeUsersChartDataSets[1].data.push(day.monthly);
			this.activeUsersChartDataSets[2].data.push(day.yearly);
			this.activeUsersChartLabels.push(moment.unix(day.timestamp).format('LL'));
		}

		// Show the currently active users on the bar chart
		if(days.length > 0){
			this.currentlyActiveUsersDataSets[0].data = [days[days.length - 1].daily, days[days.length - 1].monthly, days[days.length - 1].yearly];
		}else{
			this.currentlyActiveUsersDataSets[0].data = [0, 0, 0];
		}
	}

	GoBack(){
		this.router.navigate(['dev', this.app.Id]);
	}
}