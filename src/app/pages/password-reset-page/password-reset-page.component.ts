import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
import { enUS } from 'src/locales/locales';
declare var io: any;

const sendPasswordResetEmailKey = "sendPasswordResetEmail";

@Component({
	selector: 'dav-website-password-reset-page',
	templateUrl: './password-reset-page.component.html'
})
export class PasswordResetPageComponent{
	locale = enUS.passwordResetPage;
	socket: any = null;
	email: string = "";
	errorMessage: string = "";
	loading: boolean = false;
	spinnerSize: SpinnerSize = SpinnerSize.small;

	constructor(
		public dataService: DataService,
		private router: Router
	){
		this.locale = this.dataService.GetLocale().passwordResetPage;
	}

	ngOnInit(){
		this.socket = io();
		this.socket.on(sendPasswordResetEmailKey, (response: ApiResponse<{}> | ApiErrorResponse) => this.SendPasswordResetEmailResponse(response));
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input element
		setTimeout(() => {
			SetTextFieldAutocomplete('email-text-field', 'email', true);
		}, 1);
	}

	SendPasswordResetEmail(){
		if(this.email.length < 3 || !this.email.includes('@')) return;

		this.errorMessage = "";
		this.loading = true;
		this.socket.emit(sendPasswordResetEmailKey, {email: this.email});
	}

	SendPasswordResetEmailResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			// Redirect to start page and show message
			this.dataService.startPageSuccessMessage = this.locale.successMessage;
			this.router.navigate(['/']);
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendPasswordResetEmailErrorMessage(errorCode);
		}

		// Hide the spinner
		this.loading = false;
	}

	GetSendPasswordResetEmailErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 2801:
				return this.locale.errors.userNotFound;
			default:
				return this.locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString());
		}
	}
}