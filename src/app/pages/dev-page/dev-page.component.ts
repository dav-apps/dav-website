import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageBarType, IDialogContentProps, IButtonStyles } from 'office-ui-fabric-react';
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
	createAppSubscriptionKey: number;
	apps: App[] = [];
	hoveredAppIndex: number = -1;
	addAppHovered: boolean = false;
	errorMessage: string = "";
	addAppDialogVisible: boolean = false;
	addAppDialogName: string = "";
	addAppDialogDescription: string = "";
	addAppDialogNameError: string = "";
	addAppDialogDescriptionError: string = "";
	messageBarType: MessageBarType = MessageBarType.error;
	dialogPrimaryButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}
	addAppDialogContent: IDialogContentProps = {
		title: this.locale.addAppDialog.title
	}
	
	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router
	){
		this.locale = this.dataService.GetLocale().devPage;
		this.getDevSubscriptionKey = websocketService.Subscribe(WebsocketCallbackType.GetDev, (response: ApiResponse<DevResponseData> | ApiErrorResponse) => this.GetDevResponse(response));
		this.createAppSubscriptionKey = websocketService.Subscribe(WebsocketCallbackType.CreateApp, (response: ApiResponse<App> | ApiErrorResponse) => this.CreateAppResponse(response));
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}else if(!this.dataService.user.IsDev){
			this.dataService.startPageErrorMessage = this.locale.accessNotAllowedMessage;
			this.router.navigate(['/']);
			return;
		}

		this.websocketService.Emit(WebsocketCallbackType.GetDev, {jwt: this.dataService.user.JWT});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getDevSubscriptionKey,
			this.createAppSubscriptionKey
		)
	}

	ShowApp(appId: number){
		this.router.navigate(['dev', appId])
	}

	ShowStatistics(){
		this.router.navigate(['dev', 'statistics'])
	}

	ShowAddAppDialog(){
		this.addAppDialogName = "";
		this.addAppDialogDescription = "";
		this.addAppDialogNameError = "";
		this.addAppDialogDescriptionError = "";

		this.addAppDialogContent.title = this.locale.addAppDialog.title;
		this.addAppDialogVisible = true;
	}

	AddApp(){
		this.addAppDialogNameError = "";
		this.addAppDialogDescriptionError = "";

		this.websocketService.Emit(WebsocketCallbackType.CreateApp, {
			jwt: this.dataService.user.JWT,
			name: this.addAppDialogName,
			description: this.addAppDialogDescription
		});
	}

	GetDevResponse(response: ApiResponse<DevResponseData> | ApiErrorResponse){
		if(response.status == 200){
			this.apps = (response as ApiResponse<DevResponseData>).data.apps;
		}else{
			// Show error
			this.errorMessage = this.locale.unexpectedErrorShort.replace('{0}', (response as ApiErrorResponse).errors[0].code.toString());
		}
	}

	CreateAppResponse(response: ApiResponse<App> | ApiErrorResponse){
		if(response.status == 201){
			this.apps.push((response as ApiResponse<App>).data);
			this.addAppDialogVisible = false;
		}else{
			let errors = (response as ApiErrorResponse).errors;

			for(let error of errors){
				let errorCode = error.code;

				switch(errorCode){
					case 2111:
						this.addAppDialogNameError = this.locale.addAppDialog.errors.nameTooShort;
						break;
					case 2112:
						this.addAppDialogDescriptionError = this.locale.addAppDialog.errors.descriptionTooShort;
						break;
					case 2203:
						this.addAppDialogNameError = this.locale.addAppDialog.errors.nameTooShort;
						break;
					case 2204:
						this.addAppDialogDescriptionError = this.locale.addAppDialog.errors.descriptionTooShort;
						break;
					case 2303:
						this.addAppDialogNameError = this.locale.addAppDialog.errors.nameTooLong;
						break;
					case 2304:
						this.addAppDialogDescriptionError = this.locale.addAppDialog.errors.descriptionTooLong;
						break;
				}
			}
		}
	}
}