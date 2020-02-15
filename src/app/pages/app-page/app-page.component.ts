import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles, IButtonStyles, IDialogContentProps } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, App, Table, Api } from 'dav-npm';
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
	createTableSubscriptionKey: number;
	createApiSubscriptionKey: number;
	app: App = new App(0, "", "", false, null, null, null);
	editAppDialogVisible: boolean = false;
	publishAppDialogVisible: boolean = false;
	addTableDialogVisible: boolean = false;
	addApiDialogVisible: boolean = false;
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
	addTableDialogNewTableName: string = "";
	addTableDialogNewTableError: string = "";
	addApiDialogApiName: string = "";
	addApiDialogApiNameError: string = "";
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
	dialogPrimaryButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}
	editAppDialogContent: IDialogContentProps = {
		title: this.locale.editAppDialog.title
	}
	publishAppDialogContent: IDialogContentProps = {
		title: this.locale.publishAppDialog.publishTitle,
		subText: this.locale.publishAppDialog.publishSubtext,
		styles: {
			subText: {
				fontSize: 14
			}
		}
	}
	addTableDialogContent: IDialogContentProps = {
		title: this.locale.addTableDialog.title
	}
	addApiDialogContent: IDialogContentProps = {
		title: this.locale.addApiDialog.title
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
		this.createTableSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.CreateTable, (response: ApiResponse<Table> | ApiErrorResponse) => this.CreateTableResponse(response));
		this.createApiSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.CreateApi, (response: ApiResponse<Api> | ApiErrorResponse) => this.CreateApiResponse(response));
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

		let appId = this.activatedRoute.snapshot.paramMap.get('id');
		
		this.websocketService.Emit(WebsocketCallbackType.GetApp, {
			jwt: this.dataService.user.JWT,
			id: appId
		});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getAppSubscriptionKey,
			this.updateAppSubscriptionKey,
			this.createTableSubscriptionKey,
			this.createApiSubscriptionKey
		)
	}

	GoBack(){
		this.router.navigate(['dev']);
	}

	ShowAppStatistics(){
		this.router.navigate(['dev', this.app.Id, 'statistics']);
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
		this.ClearEditAppDialogErrors();
		
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

	ShowPublishAppDialog(){
		this.publishAppDialogContent.title = this.app.Published ? this.locale.publishAppDialog.unpublishTitle : this.locale.publishAppDialog.publishTitle;
		this.publishAppDialogContent.subText = this.app.Published ? this.locale.publishAppDialog.unpublishSubtext : this.locale.publishAppDialog.publishSubtext;
		this.publishAppDialogVisible = true;
	}

	ShowAddTableDialog(){
		this.addTableDialogNewTableName = "";
		this.addTableDialogNewTableError = "";
		this.addTableDialogContent.title = this.locale.addTableDialog.title;
		this.addTableDialogVisible = true;
	}

	ShowAddApiDialog(){
		this.addApiDialogApiName = "";
		this.addApiDialogApiNameError = "";
		this.addApiDialogContent.title = this.locale.addApiDialog.title;
		this.addApiDialogVisible = true;
	}

	PublishApp(){
		this.websocketService.Emit(WebsocketCallbackType.UpdateApp, {
			jwt: this.dataService.user.JWT,
			id: this.app.Id,
			published: !this.app.Published
		});
	}

	AddTable(){
		this.addTableDialogNewTableError = "";
		
		this.websocketService.Emit(WebsocketCallbackType.CreateTable, {
			jwt: this.dataService.user.JWT,
			appId: this.app.Id,
			name: this.addTableDialogNewTableName
		});
	}

	AddApi(){
		this.addApiDialogApiNameError = "";

		this.websocketService.Emit(WebsocketCallbackType.CreateApi, {
			jwt: this.dataService.user.JWT,
			appId: this.app.Id,
			name: this.addApiDialogApiName
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
		if(this.editAppDialogVisible){
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
		}else if(this.publishAppDialogVisible){
			if(response.status == 200){
				this.app.Published = !this.app.Published;
			}

			this.publishAppDialogVisible = false;
		}
	}

	CreateTableResponse(response: (ApiResponse<Table> | ApiErrorResponse)){
		if(response.status == 201){
			this.app.Tables.push((response as ApiResponse<Table>).data);
			this.addTableDialogVisible = false;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;

			switch(errorCode){
				case 2111:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameTooShort;
					break;
				case 2203:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameTooShort;
					break;
				case 2303:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameTooLong;
					break;
				case 2502:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameInvalid;
					break;
			}
		}
	}

	CreateApiResponse(response: (ApiResponse<Api> | ApiErrorResponse)){
		if(response.status == 201){
			this.app.Apis.push((response as ApiResponse<Api>).data);
			this.addApiDialogVisible = false;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;

			switch(errorCode) {
				case 2111:
					this.addApiDialogApiNameError = this.locale.addApiDialog.errors.nameTooShort;
					break;
				case 2203:
					this.addApiDialogApiNameError = this.locale.addApiDialog.errors.nameTooShort;
					break;
				case 2303:
					this.addApiDialogApiNameError = this.locale.addApiDialog.errors.nameTooLong;
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