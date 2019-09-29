import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageBarType } from 'office-ui-fabric-react';
import { ApiResponse, SignupResponseData, ApiErrorResponse } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const signupKey = "signup";

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
	errorMessage: string = "";
	messageBarType: MessageBarType = MessageBarType.error;

	constructor(
		public dataService: DataService,
		public router: Router
	){}

	ngOnInit(){
		this.socket = io();
		this.socket.on(signupKey, (message: (ApiResponse<SignupResponseData> | ApiErrorResponse)) => this.SignupResponse(message));
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

		this.socket.emit(signupKey, {
			username: this.username,
			email: this.email,
			password: this.password
		});
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
}