import { Component } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';
import { SetTextFieldAutocomplete } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-signup-page',
	templateUrl: './signup-page.component.html'
})
export class SignupPageComponent{
	username: string = "";
	email: string = "";
	password: string = "";
	passwordConfirmation: string = "";
	errorMessage: string = "";
	messageBarType: MessageBarType = MessageBarType.error;

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
		
	}
}