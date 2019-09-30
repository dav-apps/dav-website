import { Component } from '@angular/core';
import { ApiResponse, ApiErrorResponse, App } from 'dav-npm';
declare var io: any;

const getAllAppsKey = "getAllApps";

@Component({
	selector: 'dav-website-apps-page',
	templateUrl: './apps-page.component.html'
})
export class AppsPageComponent{
	socket: any = null;
	apps: App[] = [];

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