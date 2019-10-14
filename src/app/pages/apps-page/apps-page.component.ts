import { Component } from '@angular/core';
import { ApiResponse, ApiErrorResponse, App } from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from 'src/app/services/data-service';
declare var io: any;

const getAllAppsKey = "getAllApps";

@Component({
	selector: 'dav-website-apps-page',
	templateUrl: './apps-page.component.html'
})
export class AppsPageComponent{
	locale = enUS.appsPage;
	socket: any = null;
	apps: App[] = [];

	constructor(
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().appsPage;
	}

	ngOnInit(){
		this.socket = io();
		this.socket.on(getAllAppsKey, (message: (ApiResponse<App[]> | ApiErrorResponse)) => this.GetAllAppsResponse(message));

		this.socket.emit(getAllAppsKey, {});
	}

	async GetAllAppsResponse(response: (ApiResponse<App[]> | ApiErrorResponse)){
		if(response.status == 200){
			this.apps = (response as ApiResponse<App[]>).data;
		}
	}
}