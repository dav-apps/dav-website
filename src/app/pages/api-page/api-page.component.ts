import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles, IButtonStyles, IDialogContentProps } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, Api, ApiError } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-api-page',
	templateUrl: './api-page.component.html'
})
export class ApiPageComponent{
	locale = enUS.apiPage;
	getApiSubscriptionKey: number;
	setApiErrorSubscriptionKey: number;
	api: Api = new Api(0, "", [], [], []);
	appId: number = 0;
	addErrorDialogVisible: boolean = false;
	addErrorDialogCode: string = "";
	addErrorDialogCodeError: string = "";
	addErrorDialogMessage: string = "";
	addErrorDialogMessageError: string = "";
	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}
	dialogPrimaryButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}
	addErrorDialogContentProps: IDialogContentProps = {
		title: this.locale.addErrorDialog.title
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().apiPage;
		this.getApiSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetApi, (response: ApiResponse<Api> | ApiErrorResponse) => this.GetApiResponse(response));
		this.setApiErrorSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.SetApiError, (response: ApiResponse<ApiError> | ApiErrorResponse) => this.SetApiErrorResponse(response));
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

		this.appId = +this.activatedRoute.snapshot.paramMap.get('id');
		let apiId = this.activatedRoute.snapshot.paramMap.get('api_id');

		this.websocketService.Emit(WebsocketCallbackType.GetApi, {
			jwt: this.dataService.user.JWT, 
			id: apiId
		});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getApiSubscriptionKey,
			this.setApiErrorSubscriptionKey
		)
	}

	GoBack(){
		this.router.navigate(['dev', this.appId]);
	}

	ShowAddErrorDialog(){
		this.addErrorDialogCode = "";
		this.addErrorDialogMessage = "";
		this.addErrorDialogContentProps.title = this.locale.addErrorDialog.title;
		this.addErrorDialogVisible = true;
	}

	AddError(){
		this.addErrorDialogCodeError = "";
		this.addErrorDialogMessageError = "";

		this.websocketService.Emit(WebsocketCallbackType.SetApiError, {
			apiId: this.api.Id,
			code: +this.addErrorDialogCode,
			message: this.addErrorDialogMessage
		});
	}

	SortErrors(){
		// Sort the errors by error code
		this.api.Errors.sort((a: ApiError, b: ApiError) => {
			if(a.Code > b.Code) return 1;
			else if(a.Code < b.Code) return -1;
			return 0;
		});
	}

	GetApiResponse(response: ApiResponse<Api> | ApiErrorResponse){
		if(response.status == 200){
			this.api = (response as ApiResponse<Api>).data;
			this.SortErrors();
		}else{
			// Redirect to the app page
			this.router.navigate(['dev', this.appId]);
		}
	}

	SetApiErrorResponse(response: ApiResponse<ApiError> | ApiErrorResponse){
		if(response.status == 200){
			this.api.Errors.push((response as ApiResponse<ApiError>).data);
			this.SortErrors();
			this.addErrorDialogVisible = false;
		}else{
			let errors = (response as ApiErrorResponse).errors;

			for(let error of errors){
				switch(error.code){
					case 2135:
						this.addErrorDialogCodeError = this.locale.addErrorDialog.errors.codeMissing;
						break;
					case 2136 || 2210:
						this.addErrorDialogMessageError = this.locale.addErrorDialog.errors.messageTooShort;
						break;
					case 2310:
						this.addErrorDialogMessageError = this.locale.addErrorDialog.errors.messageTooLong;
						break;
					case 2407:
						this.addErrorDialogCodeError = this.locale.addErrorDialog.errors.codeInvalid;
						break;
				}
			}
		}
	}
}