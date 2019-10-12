import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBarType } from 'office-ui-fabric-react';
import { ApiResponse, SignupResponseData, LoginResponseData, ApiErrorResponse } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const signupKey = "signup";
const signupImplicitKey = "signupImplicit";
const signupTypeImplicit = "implicit";
const signupTypeSession = "session";

@Component({
	selector: 'dav-website-signup-page',
	templateUrl: './signup-page.component.html'
})
export class SignupPageComponent{
	socket: any = null;
	username: string = "";
	email: string = "";
	password: string = "";
	passwordConfirmation: string = "";
	signupType: SignupType = SignupType.Normal;
	appId: number = -1;
	apiKey: string = null;
	redirectUrl: string = null;
	errorMessage: string = "";
	messageBarType: MessageBarType = MessageBarType.error;

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.socket = io();
		this.socket.on(signupKey, (message: (ApiResponse<SignupResponseData> | ApiErrorResponse)) => this.SignupResponse(message));
		this.socket.on(signupImplicitKey, (message: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.SignupImplicitResponse(message));

		let type = this.activatedRoute.snapshot.queryParamMap.get('type');
		if(!type) return;

		if(type == signupTypeImplicit){
			this.signupType = SignupType.Implicit;
		}else if(type == signupTypeSession){
			this.signupType = SignupType.Session;
		}

		this.appId = +this.activatedRoute.snapshot.queryParamMap.get('app_id');
		this.apiKey = this.activatedRoute.snapshot.queryParamMap.get('api_key');
		this.redirectUrl = decodeURIComponent(this.activatedRoute.snapshot.queryParamMap.get('redirect_url'));

		if(this.signupType == SignupType.Implicit){
			// Check if apiKey and redirectUrl are present
			if(!this.apiKey || this.apiKey.length < 2 || !this.redirectUrl || this.redirectUrl.length < 2) this.RedirectToStartPageWithError();
			else this.dataService.hideNavbarAndFooter = true;
		}else if(this.signupType == SignupType.Session){
			// Check if appId, apiKey and redirectUrl are present
			if(isNaN(this.appId) || this.appId <= 0 || !this.apiKey || this.apiKey.length < 2 || !this.redirectUrl || this.redirectUrl.length < 2) this.RedirectToStartPageWithError();
			else this.dataService.hideNavbarAndFooter = true;
		}
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('username-text-field', 'username', true);
			SetTextFieldAutocomplete('email-text-field', 'email');
			SetTextFieldAutocomplete('password-text-field', 'new-password');
			SetTextFieldAutocomplete('password-confirmation-text-field', 'new-password');
		}, 1);
	}

	Signup(){
		if(this.password != this.passwordConfirmation){
			this.errorMessage = "Your password doesn't match your password confimration";
			this.passwordConfirmation = "";
			return;
		}
		this.errorMessage = "";

		switch (this.signupType) {
			case SignupType.Normal:
				this.socket.emit(signupKey, {
					username: this.username,
					email: this.email,
					password: this.password
				});
				break;
			case SignupType.Implicit:
				this.socket.emit(signupImplicitKey, {
					apiKey: this.apiKey,
					username: this.username,
					email: this.email,
					password: this.password
				});
				break;
		}
	}

	async SignupResponse(response: (ApiResponse<SignupResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Save the jwt
			await this.dataService.user.Login((response as ApiResponse<SignupResponseData>).data.jwt);

			// Redirect to the start page
			this.router.navigate(['/']);
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSignupErrorMessage(errorCode);

			if(errorCode == 2202 || errorCode == 2302){
				this.password = "";
				this.passwordConfirmation = "";
			}
		}
	}

	async SignupImplicitResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<LoginResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSignupErrorMessage(errorCode);

			if(errorCode == 2202 || errorCode == 2302){
				this.password = "";
				this.passwordConfirmation = "";
			}
		}
	}

	GetSignupErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 2105:
				return "Please enter your username";
			case 2106:
				return "Please enter your email";
			case 2107:
				return "Please enter a password";
			case 2201:
				return "Your username is too short";
			case 2202:
				return "The password is too short";
			case 2301:
				return "Your username is too long";
			case 2302:
				return "The password is too long";
			case 2401:
				return "Your email is invalid";
			case 2701:
				return "The username is already taken";
			case 2702:
				return "The email is already taken";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}

	RedirectToStartPageWithError(){
		this.dataService.startPageErrorMessage = "An unexpected error occured. Please try again.";
		this.router.navigate(['/']);
	}
}

enum SignupType{
	Normal = 0,
	Implicit = 1,
	Session = 2
}