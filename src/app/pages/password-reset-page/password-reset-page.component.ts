import { Component } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const sendPasswordResetEmailKey = "sendPasswordResetEmail";

@Component({
	selector: 'dav-website-password-reset-page',
	templateUrl: './password-reset-page.component.html'
})
export class PasswordResetPageComponent{
	socket: any = null;
	messageBarType: MessageBarType = MessageBarType.error;
	email: string = "";
	errorMessage: string = "";

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
		if(this.email.length < 3 && !this.email.includes('@')) return;

		this.errorMessage = "";
		this.socket.emit(sendPasswordResetEmailKey, {email: this.email});
	}

	SendPasswordResetEmailResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			// TODO Redirect to start page
			
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendPasswordResetEmailErrorMessage(errorCode);
		}
	}

	GetSendPasswordResetEmailErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 2801:
				return "Can't find a user with this email address";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}
}