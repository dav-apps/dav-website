import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBarType, IButtonStyles, IconFontSizes } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, LoginResponseData, DevResponseData } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const loginKey = "login";
const loginImplicitKey = "loginImplicit";
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
		}else if(this.loginType == LoginType.Session){
			
		}

		// Hide navbar and footer
		this.dataService.hideNavbarAndFooter = true;
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
				
				break;
		}
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
}

enum LoginType{
	Normal,
	Implicit,
	Session
}