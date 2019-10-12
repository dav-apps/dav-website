import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBarType, IButtonStyles } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, LoginResponseData, CreateSessionResponseData } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;
declare var deviceAPI: any;

const loginKey = "login";
const loginImplicitKey = "loginImplicit";
const createSessionKey = "createSession";
const createSessionWithJwtKey = "createSessionWithJwt";
const loginTypeImplicit = "implicit";
const loginTypeSession = "session";

@Component({
	selector: 'dav-website-login-page',
	templateUrl: './login-page.component.html'
})
export class LoginPageComponent{
	socket: any = null;
	loginType: LoginType = LoginType.Normal;
	email: string = "";
	password: string = "";
	errorMessage: string = "";
	appId: number = -1;
	apiKey: string = null;
	redirectUrl: string = null;
	messageBarType: MessageBarType = MessageBarType.error;
	loginButtonStyles: IButtonStyles = {
		root: {
			marginTop: 24
		}
	}

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.socket = io();
		this.socket.on(loginKey, (response: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.LoginResponse(response));
		this.socket.on(loginImplicitKey, (response: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.LoginImplicitResponse(response));
		this.socket.on(createSessionKey, (response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)) => this.CreateSessionResponse(response));
		this.socket.on(createSessionWithJwtKey, (response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)) => this.CreateSessionWithJwtResponse(response));

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

	Login(){
		this.errorMessage = "";

		switch (this.loginType) {
			case LoginType.Normal:
				// Call login on the server
				this.socket.emit(loginKey, {
					email: this.email,
					password: this.password
				});
				break;
			case LoginType.Implicit:
				// Call loginImplicit on the server
				this.socket.emit(loginImplicitKey, {
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

				if(deviceName == "Not available") deviceName = "Unknown";
				if(deviceType == "Not available") deviceType = "Unknown";
				if(deviceOs == "Not available") deviceOs = "Unknown";

				// Call createSession on the server
				this.socket.emit(createSessionKey, {
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

		if(deviceName == "Not available") deviceName = "Unknown";
		if(deviceType == "Not available") deviceType = "Unknown";
		if(deviceOs == "Not available") deviceOs = "Unknown";

		this.socket.emit(createSessionWithJwtKey, {
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

			// Redirect to the start page
			this.router.navigate(['/']);
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);

			if(errorCode != 2106){
				this.password = "";
			}
		}
	}

	async LoginImplicitResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<LoginResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);

			if(errorCode != 2106){
				this.password = "";
			}
		}
	}

	async CreateSessionResponse(response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<CreateSessionResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetLoginErrorMessage(errorCode);

			if(errorCode != 2106){
				this.password = "";
			}
		}
	}

	async CreateSessionWithJwtResponse(response: (ApiResponse<CreateSessionResponseData> | ApiErrorResponse)){
		if(response.status == 201){
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
				return "Login failed";
			case 2106:
				return "Please enter your email";
			case 2107:
				return "Please enter your password";
			case 2801:
				return "Login failed";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}

	RedirectToStartPageWithError(){
		this.dataService.startPageErrorMessage = "An unexpected error occured. Please try again.";
		this.router.navigate(['/']);
	}

	NavigateToSignup(){
		if(this.loginType == LoginType.Implicit){
			this.router.navigateByUrl(`/signup?type=${loginTypeImplicit}&api_key=${this.apiKey}&redirect_url=${this.redirectUrl}`);
		}else if(this.loginType == LoginType.Session){
			this.router.navigateByUrl(`/signup?type=${loginTypeSession}&api_key=${this.apiKey}&app_id=${this.appId}&redirect_url=${this.redirectUrl}`);
		}
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