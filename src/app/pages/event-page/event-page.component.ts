import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, Event, EventSummaryOsCount, EventSummaryBrowserCount, EventSummaryCountryCount } from 'dav-npm';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import Chartkick from "chartkick";
import * as moment from 'moment';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-event-page',
	templateUrl: './event-page.component.html'
})
export class EventPageComponent{
	locale = enUS.eventPage;
	getEventByNameSubscriptionKey: number;
	@ViewChild(BaseChartDirective, {static: true}) chart: BaseChartDirective;
	appId: number;
	event: Event = new Event(0, 0, "", []);
	eventDataSets: ChartDataSets[] = [{ data: [], label: "Event" }]
	eventChartLabels: Label[] = []
	eventChartOptions: ChartOptions = {}
	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}

	//#region Pie chart variables
	pieChartFormats: {name: string, os: boolean, selector?: string}[] = [		// name -> {0}: Name, {1}: Version
		{name: "{0}", os: true},
		{name: "{0} {1}", os: true},
		{name: "{0} {1}", os: true, selector: "Windows"},
		{name: "{0} {1}", os: true, selector: "Android"},
		{name: "{0}", os: false},
		{name: "{0} {1}", os: false, selector: "Edge"},
		{name: "{0} {1}", os: false, selector: "Chrome"},
		{name: "{0} {1}", os: false, selector: "Firefox"}
	]
	pieChartTitles: string[] = [
		this.locale.pieChartTitles.operatingSystems, 
		this.locale.pieChartTitles.operatingSystemsVersions, 
		this.locale.pieChartTitles.windowsVersions, 
		this.locale.pieChartTitles.androidVersions,
		this.locale.pieChartTitles.browser, 
		this.locale.pieChartTitles.edgeVersions,
		this.locale.pieChartTitles.chromeVersions,
		this.locale.pieChartTitles.firefoxVersions
	]
	pieChartData: number[][] = [[], [], [], [], [], []];
	pieChartLabels: Label[][] = [[], [], [], [], [], []];
	pieChartsLoaded: boolean = false;
	//#endregion
	
	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().eventPage;
		moment.locale(this.dataService.locale);

		this.getEventByNameSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetEventByName, (response: ApiResponse<Event> | ApiErrorResponse) => this.GetEventByNameResponse(response));

		// Update the pie chart titles
		this.pieChartTitles[0] = this.locale.pieChartTitles.operatingSystems;
		this.pieChartTitles[1] = this.locale.pieChartTitles.operatingSystemsVersions;
		this.pieChartTitles[2] = this.locale.pieChartTitles.windowsVersions;
		this.pieChartTitles[3] = this.locale.pieChartTitles.androidVersions;
		this.pieChartTitles[4] = this.locale.pieChartTitles.browser;
		this.pieChartTitles[5] = this.locale.pieChartTitles.edgeVersions;
		this.pieChartTitles[6] = this.locale.pieChartTitles.chromeVersions;
		this.pieChartTitles[7] = this.locale.pieChartTitles.firefoxVersions;
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}

		this.appId = +this.activatedRoute.snapshot.paramMap.get('id');
		let eventName = this.activatedRoute.snapshot.paramMap.get('name');
		this.eventDataSets[0].label = eventName;

		this.websocketService.Emit(WebsocketCallbackType.GetEventByName, {
			jwt: this.dataService.user.JWT,
			name: eventName,
			appId: this.appId
		});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getEventByNameSubscriptionKey
		)
	}

	GetEventByNameResponse(response: ApiResponse<Event> | ApiErrorResponse){
		if(response.status != 200){
			this.GoBack();
			return;
		}

		this.event = (response as ApiResponse<Event>).data;

		// Get the total count
		for(let summary of this.event.Summaries){
			this.eventDataSets[0].data.push(summary.Total);
			this.eventChartLabels.push(moment(summary.Time.toString()).format('l'));
		}
		this.chart.update();

		let countries: Map<string, number> = new Map();
		let pieChartMaps: Map<string, number>[] = [];

		// Init the pieChartMaps
		pieChartMaps = [];
		for(let i = 0; i < this.pieChartFormats.length; i++) pieChartMaps.push(new Map());

		for(let summary of this.event.Summaries){
			// Get the os and browser data
			for(let i = 0; i < this.pieChartFormats.length; i++){
				let formatName = this.pieChartFormats[i].name;
				let formatOs = this.pieChartFormats[i].os;
				let formatSelector = this.pieChartFormats[i].selector;

				let map = pieChartMaps[i];
				let counts = formatOs ? summary.OsCounts : summary.BrowserCounts;

				for(let obj of counts){
					// obj is either EventSummaryOsCount or EventSummaryBrowserCount
					let entry = obj as EventSummaryOsCount | EventSummaryBrowserCount;
					let entryName = formatName.replace("{0}", entry.Name).replace("{1}", entry.Version);

					// Skip this object if there is a selector and if the name does not contain the selector
					if(formatSelector && !entryName.includes(formatSelector)) continue;

					if(map.has(entryName)){
						// Add the count of the current entry
						map.set(entryName, map.get(entryName) + entry.Count);
					}else{
						// Add the new entry to the map
						map.set(entryName, entry.Count);
					}
				}
			}

			// Get the countries
			for(let obj of summary.CountryCounts){
				if(obj.Country){
					if(countries.has(obj.Country)){
						// Add the count of the current country
						countries.set(obj.Country, countries.get(obj.Country) + obj.Count);
					}else{
						// Add the new country to the countries
						countries.set(obj.Country, obj.Count);
					}
				}
			}
		}

		// Init the map chart with the countries data
		let countriesArray = [];
		for(let entry of countries.entries()) countriesArray.push(entry);

		new Chartkick.GeoChart("map-chart", countriesArray);

		// Init the pie charts
		for(let i = 0; i < this.pieChartFormats.length; i++){
			let format = this.pieChartFormats[i];
			this.pieChartData[i] = [];
			this.pieChartLabels[i] = [];

			if(format.os){
				for(let entry of pieChartMaps[i].entries()){
					this.pieChartLabels[i].push(entry[0]);
					this.pieChartData[i].push(entry[1]);
				}
			}else{
				for(let entry of pieChartMaps[i].entries()){
					this.pieChartLabels[i].push(entry[0]);
					this.pieChartData[i].push(entry[1]);
				}
			}
		}
		
		this.pieChartsLoaded = true;
	}

	GoBack(){
		this.router.navigate(['dev', this.appId]);
	}
}