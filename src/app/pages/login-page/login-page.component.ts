import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse, LoginResponseData, ApiErrorResponse, ApiError } from 'dav-npm';
import { MessageBarType } from 'office-ui-fabric-react';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const loginKey = "login";

@Component({
	selector: 'dav-website-login-page',
	templateUrl: './login-page.component.html'
})
export class LoginPageComponent{
	socket: any = null;
	email: string = "";
	password: string = "";
	errorMessage: string = "";
	messageBarType: MessageBarType = MessageBarType.error;

	constructor(
		public dataService: DataService,
		private router: Router
	){}

	ngOnInit(){
		this.socket = io();
		this.socket.on(loginKey, (message: (ApiResponse<LoginResponseData> | ApiErrorResponse)) => this.LoginResponse(message));
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

		this.socket.emit(loginKey, {
			email: this.email,
			password: this.password
		});
	}

	async LoginResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Save the jwt
			await this.dataService.SetJwt((response as ApiResponse<LoginResponseData>).data.jwt);

			// Redirect to the start page
			this.router.navigate(['/']);
		}else{
			this.errorMessage = this.GetLoginErrorMessage((response as ApiErrorResponse).errors[0].code);
		}
	}

	GetLoginErrorMessage(errorCode: number){
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
}