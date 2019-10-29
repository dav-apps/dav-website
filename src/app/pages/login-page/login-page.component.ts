import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBarType, IButtonStyles, SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, LoginResponseData, CreateSessionResponseData } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';
declare var deviceAPI: any;

const loginTypeImplicit = "implicit";
const loginTypeSession = "session";
const deviceInfoNotAvailable = "Not available";
const loginEventName = "login";
const loginImplicitEventName = "login_implicit";
const loginSessionEventName = "login_session";

@Component({
	selector: 'dav-website-login-page',
	templateUrl: './login-page.component.html'
})
export class LoginPageComponent{
	locale = enUS.loginPage;
	loginSubscriptionKey: number;
	loginImplicitSubscriptionKey: number;
	createSessionSubscriptionKey: number;
	createSessionWithJwtSubscriptionKey: number;
	loginType: LoginType = LoginType.Normal;
	email: string = "";
	password: string = "";
	errorMessage: string = "";
	appId: number = -1;
	apiKey: string = null;
	redirectUrl: string = null;
	loginLoading: boolean = false;
	spinnerSize: SpinnerSize = SpinnerSize.small;
	messageBarType: MessageBarType = MessageBarType.error;
	loginButtonStyles: IButtonStyles = {
		root: {
			marginTop: 24
		}
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().loginPage;

		this.loginSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.Login, (response: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.LoginResponse(response));
		this.loginImplicitSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.LoginImplicit, (response: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.LoginImplicitResponse(response));
		this.createSessionSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.CreateSession, (response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)) => this.CreateSessionResponse(response));
		this.createSessionWithJwtSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.CreateSessionWithJwt, (response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)) => this.CreateSessionWithJwtResponse(response));

		let type = this.activatedRoute.snapshot.queryParamMap.get('type');
		if(!type) return;

		if(type == loginTypeImplicit){
			this.loginType = LoginType.Implicit;
		}else if(type == loginTypeSession){
			this.loginType = LoginType.Session;
		}

		this.appId = +this.activatedRoute.snapshot.queryParamMap.get("app_id");
		this.apiKey = this.activatedRoute.snapshot.queryParamMap.get("api_key");
		this.redirectUrl = decodeURIComponent(this.activatedRoute.snapshot.queryParamMap.get("redirect_url"));

		if(this.loginType == LoginType.Implicit){
			// Check if apiKey and redirectUrl are present
			if(!this.apiKey || this.apiKey.length < 2 || !this.redirectUrl || this.redirectUrl.length < 2) this.RedirectToStartPageWithError();
			else this.dataService.hideNavbarAndFooter = true;
		}else if(this.loginType == LoginType.Session){
			// Check if appId, apiKey and redirectUrl are present
			if(isNaN(this.appId) || this.appId <= 0 || !this.apiKey || this.apiKey.length < 2 || !this.redirectUrl || this.redirectUrl.length < 2) this.RedirectToStartPageWithError();
			else this.dataService.hideNavbarAndFooter = true;
		}
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('email-text-field', 'email', true);
			SetTextFieldAutocomplete('password-text-field', 'current-password');
		}, 1);
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.loginSubscriptionKey,
			this.loginImplicitSubscriptionKey,
			this.createSessionSubscriptionKey,
			this.createSessionWithJwtSubscriptionKey
		)
	}

	Login(){
		this.errorMessage = "";
		this.loginLoading = true;

		switch (this.loginType) {
			case LoginType.Normal:
				// Call login on the server
				this.websocketService.Emit(WebsocketCallbackType.Login, {
					email: this.email,
					password: this.password
				});
				break;
			case LoginType.Implicit:
				// Call loginImplicit on the server
				this.websocketService.Emit(WebsocketCallbackType.LoginImplicit, {
					apiKey: this.apiKey,
					email: this.email,
					password: this.password
				});
				break;
			case LoginType.Session:
				// Get device info
				let deviceName = deviceAPI.deviceName;
				let deviceType = this.Capitalize(deviceAPI.deviceType as string);
				let deviceOs = deviceAPI.osName;

				if(deviceName == deviceInfoNotAvailable) deviceName = this.locale.deviceInfoUnknown;
				if(deviceType == deviceInfoNotAvailable) deviceType = this.locale.deviceInfoUnknown;
				if(deviceOs == deviceInfoNotAvailable) deviceOs = this.locale.deviceInfoUnknown;

				// Call createSession on the server
				this.websocketService.Emit(WebsocketCallbackType.CreateSession, {
					email: this.email,
					password: this.password,
					appId: this.appId,
					apiKey: this.apiKey,
					deviceName,
					deviceType,
					deviceOs
				});
				break;
		}
	}

	LoginAsLoggedInUser(){
		// Get device info
		let deviceName = deviceAPI.deviceName;
		let deviceType = this.Capitalize(deviceAPI.deviceType as string);
		let deviceOs = deviceAPI.osName;

		if(deviceName == deviceInfoNotAvailable) deviceName = this.locale.deviceInfoUnknown;
		if(deviceType == deviceInfoNotAvailable) deviceType = this.locale.deviceInfoUnknown;
		if(deviceOs == deviceInfoNotAvailable) deviceOs = this.locale.deviceInfoUnknown;

		this.websocketService.Emit(WebsocketCallbackType.CreateSessionWithJwt, {
			jwt: this.dataService.user.JWT,
			appId: this.appId,
			apiKey: this.apiKey,
			deviceName,
			deviceType,
			deviceOs
		});
	}

	async LoginResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Save the jwt
			await this.dataService.user.Login((response as ApiResponse<LoginResponseData>).data.jwt);

			// Log the event
			await this.LogEvent(loginEventName);

			// Redirect to the start page
			this.router.navigate(['/']);
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);

			if(errorCode != 2106){
				this.password = "";
			}

			// Hide the spinner
			this.loginLoading = false;
		}
	}

	async LoginImplicitResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Log the event
			await this.LogEvent(loginImplicitEventName);

			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<LoginResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);

			if(errorCode != 2106){
				this.password = "";
			}

			// Hide the spinner
			this.loginLoading = false;
		}
	}

	async CreateSessionResponse(response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Log the event
			await this.LogEvent(loginSessionEventName);

			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<CreateSessionResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);

			if(errorCode != 2106){
				this.password = "";
			}

			// Hide the spinner
			this.loginLoading = false;
		}
	}

	async CreateSessionWithJwtResponse(response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Log the event
			await this.LogEvent(loginSessionEventName);

			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<CreateSessionResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);
		}
	}

	GetLoginErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 1201:
				return this.locale.errors.loginFailed;
			case 2106:
				return this.locale.errors.emailMissing;
			case 2107:
				return this.locale.errors.passwordMissing;
			case 2801:
				return this.locale.errors.loginFailed;
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
		}
	}

	RedirectToStartPageWithError(){
		this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong;
		this.router.navigate(['/']);
	}

	NavigateToSignup(){
		if(this.loginType == LoginType.Implicit){
			this.router.navigateByUrl(`/signup?type=${loginTypeImplicit}&api_key=${this.apiKey}&redirect_url=${this.redirectUrl}`);
		}else if(this.loginType == LoginType.Session){
			this.router.navigateByUrl(`/signup?type=${loginTypeSession}&api_key=${this.apiKey}&app_id=${this.appId}&redirect_url=${this.redirectUrl}`);
		}
	}

	async LogEvent(name: string){
		await this.dataService.LogEvent(name, true, {
			browser_name: deviceAPI.browserName,
			browser_version: deviceAPI.browserVersion,
			os_name: deviceAPI.osCodeName,
			os_version: deviceAPI.osVersion
		});
	}

	Capitalize(s: string){
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
}

enum LoginType{
	Normal = 0,
	Implicit = 1,
	Session = 2
}