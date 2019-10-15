import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBarType, SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, SignupResponseData, LoginResponseData, ApiErrorResponse } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
import { enUS } from 'src/locales/locales';
declare var io: any;
declare var deviceAPI: any;

const signupKey = "signup";
const signupImplicitKey = "signupImplicit";
const signupSessionKey = "signupSession";
const signupTypeImplicit = "implicit";
const signupTypeSession = "session";

@Component({
	selector: 'dav-website-signup-page',
	templateUrl: './signup-page.component.html'
})
export class SignupPageComponent{
	locale = enUS.signupPage;
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
	spinnerSize: SpinnerSize = SpinnerSize.small;
	signupLoading: boolean = false;

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().signupPage;

		this.socket = io();
		this.socket.on(signupKey, (message: (ApiResponse<SignupResponseData> | ApiErrorResponse)) => this.SignupResponse(message));
		this.socket.on(signupImplicitKey, (message: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.SignupImplicitResponse(message));
		this.socket.on(signupSessionKey, (message: (ApiResponse<SignupResponseData> | ApiErrorResponse)) => this.SignupSessionResponse(message));

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
			this.errorMessage = this.locale.errors.passwordConfirmationNotMatching;
			this.passwordConfirmation = "";
			return;
		}
		this.errorMessage = "";
		this.signupLoading = true;

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
			case SignupType.Session:
				// Get device info
				let deviceName = deviceAPI.deviceName;
				let deviceType = this.Capitalize(deviceAPI.deviceType as string);
				let deviceOs = deviceAPI.osName;

				if(deviceName == "Not available") deviceName = this.locale.deviceInfoUnknown;
				if(deviceType == "Not available") deviceType = this.locale.deviceInfoUnknown;
				if(deviceOs == "Not available") deviceOs = this.locale.deviceInfoUnknown;

				this.socket.emit(signupSessionKey, {
					username: this.username,
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

		// Hide the spinner
		this.signupLoading = false;
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

		// Hide the spinner
		this.signupLoading = false;
	}

	async SignupSessionResponse(response: (ApiResponse<SignupResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<SignupResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSignupErrorMessage(errorCode);

			if(errorCode == 2202 || errorCode == 2302){
				this.password = "";
				this.passwordConfirmation = "";
			}
		}

		// Hide the spinner
		this.signupLoading = false;
	}

	GetSignupErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 2105:
				return this.locale.errors.usernameMissing;
			case 2106:
				return this.locale.errors.emailMissing;
			case 2107:
				return this.locale.errors.passwordMissing;
			case 2201:
				return this.locale.errors.usernameTooShort;
			case 2202:
				return this.locale.errors.passwordTooShort;
			case 2301:
				return this.locale.errors.usernameTooLong;
			case 2302:
				return this.locale.errors.passwordTooLong;
			case 2401:
				return this.locale.errors.emailInvalid;
			case 2701:
				return this.locale.errors.usernameTaken;
			case 2702:
				return this.locale.errors.emailTaken;
			default:
				return this.locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString());
		}
	}

	RedirectToStartPageWithError(){
		this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong;
		this.router.navigate(['/']);
	}

	Capitalize(s: string){
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
}

enum SignupType{
	Normal = 0,
	Implicit = 1,
	Session = 2
}