import { Component } from '@angular/core';
import { ApiResponse, GetAllAppsResponseData, ApiErrorResponse } from 'dav-npm';
declare var io: any;

const getAllAppsKey = "getAllApps";

@Component({
	selector: 'dav-website-apps-page',
	templateUrl: './apps-page.component.html'
})
export class AppsPageComponent{
	socket: any = null;

	ngOnInit(){
		this.socket = io();
		this.socket.on(getAllAppsKey, (message: (ApiResponse<GetAllAppsResponseData> | ApiErrorResponse)) => this.GetAllAppsResponse(message));

		this.socket.emit(getAllAppsKey, {});
	}

	async GetAllAppsResponse(response: (ApiResponse<GetAllAppsResponseData> | ApiErrorResponse)){
		console.log(response)
	}
}