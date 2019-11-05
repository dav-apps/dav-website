import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageBarType } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, DevResponseData, App } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-dev-page',
	templateUrl: './dev-page.component.html'
})
export class DevPageComponent{
	locale = enUS.devPage;
	getDevSubscriptionKey: number;
	apps: App[] = [];
	hoveredAppIndex: number = -1;
	addAppHovered: boolean = false;
	errorMessage: string = "";
	messageBarType: MessageBarType = MessageBarType.error;
	
	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router
	){
		this.locale = this.dataService.GetLocale().devPage;
		this.getDevSubscriptionKey = websocketService.Subscribe(WebsocketCallbackType.GetDev, (response: ApiResponse<DevResponseData> | ApiErrorResponse) => this.GetDevResponse(response));
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}

		this.websocketService.Emit(WebsocketCallbackType.GetDev, {jwt: this.dataService.user.JWT});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getDevSubscriptionKey);
	}

	ShowApp(appId: number){
		this.router.navigate(['dev', appId])
	}

	GetDevResponse(response: ApiResponse<DevResponseData> | ApiErrorResponse){
		if(response.status == 200){
			this.apps = (response as ApiResponse<DevResponseData>).data.apps;
		}else{
			// Show error
			this.errorMessage = this.locale.unexpectedErrorShort.replace('{0}', (response as ApiErrorResponse).errors[0].code.toString());
		}
	}
}