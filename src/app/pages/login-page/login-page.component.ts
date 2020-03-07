import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { MessageBarType, IButtonStyles, SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, LoginResponseData, CreateSessionResponseData, Log } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { environment } from 'src/environments/environment';
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
	loginType: LoginType = LoginType.Normal;
	email: string = "";
	password: string = "";
	errorMessage: string = "";
	appId: number = -1;
	apiKey: string;
	redirectUrl: string;
	redirect: string;
	loginLoading: boolean = false;
	height: number = 400;
	backButtonWidth: number = 40;
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
		let type = this.activatedRoute.snapshot.queryParamMap.get('type');

		if(type == loginTypeImplicit){
			this.loginType = LoginType.Implicit;
		}else if(type == loginTypeSession){
			this.loginType = LoginType.Session;
		}else{
			this.loginType = LoginType.Normal;
		}

		this.appId = +this.activatedRoute.snapshot.queryParamMap.get("app_id");
		this.apiKey = this.activatedRoute.snapshot.queryParamMap.get("api_key");
		let redirectUrl = this.activatedRoute.snapshot.queryParamMap.get("redirect_url");
		if(redirectUrl) this.redirectUrl = decodeURIComponent(redirectUrl).trim();
		let redirect = this.activatedRoute.snapshot.queryParamMap.get("redirect");
		if(redirect) this.redirect = decodeURIComponent(redirect).trim();

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

	async ngOnInit(){
		this.setSize();
		await this.dataService.userPromise;
		
		if(this.dataService.user.IsLoggedIn && this.loginType == LoginType.Normal){
			if(this.redirect){
				// Redirect to the redirect url
				this.router.navigateByUrl(this.redirect);
			}else{
				// Redirect to the start page
				this.router.navigate(['/']);
			}
		}
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('email-text-field', 'email', true);
			SetTextFieldAutocomplete('password-text-field', 'current-password');
		}, 1);
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.height = window.innerHeight;
		this.backButtonWidth = window.innerWidth < 576 ? 25 : 40;
	}

	async Login(){
		this.errorMessage = "";
		this.loginLoading = true;

		switch (this.loginType) {
			case LoginType.Normal:
				// Call login on the server
				this.LoginResponse(
					await this.websocketService.Emit(WebsocketCallbackType.Login, {
						email: this.email,
						password: this.password
					})
				)
				break;
			case LoginType.Implicit:
				// Call loginImplicit on the server
				this.LoginImplicitResponse(
					await this.websocketService.Emit(WebsocketCallbackType.LoginImplicit, {
						apiKey: this.apiKey,
						email: this.email,
						password: this.password
					})
				)
				break;
			case LoginType.Session:
				// Get device info
				let deviceName = this.locale.deviceInfoUnknown;
				let deviceType = this.locale.deviceInfoUnknown;
				let deviceOs = this.locale.deviceInfoUnknown;
				
				if(deviceAPI){
					deviceName = deviceAPI.deviceName;
					deviceType = this.Capitalize(deviceAPI.deviceType as string);
					deviceOs = deviceAPI.osName;

					if(deviceName == deviceInfoNotAvailable) deviceName = this.locale.deviceInfoUnknown;
					if(deviceType == deviceInfoNotAvailable) deviceType = this.locale.deviceInfoUnknown;
					if(deviceOs == deviceInfoNotAvailable) deviceOs = this.locale.deviceInfoUnknown;
				}

				// Create the session on the server
				this.CreateSessionResponse(
					await this.websocketService.Emit(WebsocketCallbackType.CreateSession, {
						email: this.email,
						password: this.password,
						appId: this.appId,
						apiKey: this.apiKey,
						deviceName,
						deviceType,
						deviceOs
					})
				)
				break;
		}
	}

	async LoginAsLoggedInUser(){
		// Get device info
		let deviceName = this.locale.deviceInfoUnknown;
		let deviceType = this.locale.deviceInfoUnknown;
		let deviceOs = this.locale.deviceInfoUnknown;

		if(deviceAPI){
			deviceName = deviceAPI.deviceName;
			deviceType = this.Capitalize(deviceAPI.deviceType as string);
			deviceOs = deviceAPI.osName;

			if(deviceName == deviceInfoNotAvailable) deviceName = this.locale.deviceInfoUnknown;
			if(deviceType == deviceInfoNotAvailable) deviceType = this.locale.deviceInfoUnknown;
			if(deviceOs == deviceInfoNotAvailable) deviceOs = this.locale.deviceInfoUnknown;
		}

		// Create the session on the server
		this.CreateSessionWithJwtResponse(
			await this.websocketService.Emit(WebsocketCallbackType.CreateSessionWithJwt, {
				jwt: this.dataService.user.JWT,
				appId: this.appId,
				apiKey: this.apiKey,
				deviceName,
				deviceType,
				deviceOs
			})
		)
	}

	GoBack(){
		// Redirect back to the app
		window.location.href = this.redirectUrl;
	}

	async LoginResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Save the jwt
			await this.dataService.user.Login((response as ApiResponse<LoginResponseData>).data.jwt);

			// Log the event
			await this.LogEvent(loginEventName);

			if(this.redirect){
				// Redirect to the redirect url
				this.router.navigateByUrl(this.redirect);
			}else{
				// Redirect to the start page
				this.router.navigate(['/']);
			}
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
		let extras: NavigationExtras = {
			state: {
				redirectedFromLogin: true
			}
		}
		
		if(this.loginType == LoginType.Implicit){
			this.router.navigateByUrl(`/signup?type=${loginTypeImplicit}&api_key=${this.apiKey}&redirect_url=${this.redirectUrl}`, extras);
		}else if(this.loginType == LoginType.Session){
			this.router.navigateByUrl(`/signup?type=${loginTypeSession}&api_key=${this.apiKey}&app_id=${this.appId}&redirect_url=${this.redirectUrl}`, extras);
		}
	}

	async LogEvent(name: string){
		await Log(environment.apiKey, name);
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