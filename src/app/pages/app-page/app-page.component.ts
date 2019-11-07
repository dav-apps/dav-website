import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles, IButtonStyles, IDialogContentProps } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, App } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-app-page',
	templateUrl: './app-page.component.html'
})
export class AppPageComponent{
	locale = enUS.appPage;
	getAppSubscriptionKey: number;
	updateAppSubscriptionKey: number;
	app: App = new App(0, "", "", false, null, null, null);
	editAppDialogVisible: boolean = false;
	newName: string = "";
	newDescription: string = "";
	newLinkWeb: string = "";
	newLinkPlay: string = "";
	newLinkWindows: string = "";
	editAppDialogNameError: string = "";
	editAppDialogDescriptionError: string = "";
	editAppDialogLinkWebError: string = "";
	editAppDialogLinkPlayError: string = "";
	editAppDialogLinkWindowsError: string = "";
	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}
	editButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}
	editAppDialogSaveButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}
	editAppDialogContent: IDialogContentProps = {
		title: this.locale.editAppDialog.title
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().appPage;
		this.getAppSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetApp, (response: ApiResponse<App> | ApiErrorResponse) => this.GetAppResponse(response));
		this.updateAppSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.UpdateApp, (response: ApiResponse<App> | ApiErrorResponse) => this.UpdateAppResponse(response));
	}

	async ngOnInit(){
		await this.dataService.userPromise;

		let appId = this.activatedRoute.snapshot.paramMap.get('id');
		
		this.websocketService.Emit(WebsocketCallbackType.GetApp, {
			jwt: this.dataService.user.JWT,
			id: appId
		});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getAppSubscriptionKey,
			this.updateAppSubscriptionKey
		)
	}

	GoBack(){
		this.router.navigate(['dev']);
	}

	ShowEditAppDialog(){
		this.editAppDialogContent.title = this.locale.editAppDialog.title;
		
		this.ClearEditAppDialogErrors();
		this.newName = this.app.Name;
		this.newDescription = this.app.Description;
		this.newLinkWeb = this.app.LinkWeb;
		this.newLinkPlay = this.app.LinkPlay;
		this.newLinkWindows = this.app.LinkWindows;
		this.editAppDialogVisible = true;
	}

	UpdateApp(){
		if(this.newName.length == 0){
			this.editAppDialogNameError = this.locale.editAppDialog.errors.nameTooShort;
			return;
		}else if(this.newDescription.length == 0){
			this.editAppDialogDescriptionError = this.locale.editAppDialog.errors.descriptionTooShort;
			return;
		}

		this.websocketService.Emit(WebsocketCallbackType.UpdateApp, {
			jwt: this.dataService.user.JWT,
			id: this.app.Id,
			name: this.newName,
			description: this.newDescription,
			linkWeb: this.newLinkWeb,
			linkPlay: this.newLinkPlay,
			linkWindows: this.newLinkWindows
		});
	}

	GetAppResponse(response: ApiResponse<App> | ApiErrorResponse){
		if(response.status == 200){
			this.app = (response as ApiResponse<App>).data;
		}else{
			// Redirect to the Dev page
			this.router.navigate(['dev']);
		}
	}

	UpdateAppResponse(response: ApiResponse<App> | ApiErrorResponse){
		if(response.status == 200){
			this.editAppDialogVisible = false;
			this.app.Name = this.newName;
			this.app.Description = this.newDescription;
			this.app.LinkWeb = this.newLinkWeb;
			this.app.LinkPlay = this.newLinkPlay;
			this.app.LinkWindows = this.newLinkWindows;
			this.newName = "";
			this.newDescription = "";
			this.newLinkWeb = "";
			this.newLinkPlay = "";
			this.newLinkWindows = "";
		}else{
			this.ClearEditAppDialogErrors();
			let errors = (response as ApiErrorResponse).errors;

			for(let error of errors){
				let errorCode = error.code;

				switch(errorCode){
					case 2203:
						this.editAppDialogNameError = this.locale.editAppDialog.errors.nameTooShort;
						break;
					case 2204:
						this.editAppDialogDescriptionError = this.locale.editAppDialog.errors.descriptionTooShort;
						break;
					case 2303:
						this.editAppDialogNameError = this.locale.editAppDialog.errors.nameTooLong;
						break;
					case 2304:
						this.editAppDialogDescriptionError = this.locale.editAppDialog.errors.descriptionTooLong;
						break;
					case 2402:
						this.editAppDialogLinkWebError = this.locale.editAppDialog.errors.linkInvalid;
						break;
					case 2403:
						this.editAppDialogLinkPlayError = this.locale.editAppDialog.errors.linkInvalid;
						break;
					case 2404:
						this.editAppDialogLinkWindowsError = this.locale.editAppDialog.errors.linkInvalid;
						break;
					default:
						if(errors.length == 1){
							this.editAppDialogNameError = this.locale.editAppDialog.errors.unexpectedError.replace('{0}', errorCode.toString());
						}
						break;
				}
			}
		}
	}

	ClearEditAppDialogErrors(){
		this.editAppDialogNameError = "";
		this.editAppDialogDescriptionError = "";
		this.editAppDialogLinkWebError = "";
		this.editAppDialogLinkPlayError = "";
		this.editAppDialogLinkWindowsError = "";
	}
}