import { Component } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';
import { SetTextFieldAutocomplete } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-login-page',
	templateUrl: './login-page.component.html'
})
export class LoginPageComponent{
	email: string = "";
	password: string = "";
	errorMessage: string = "";
	messageBarType: MessageBarType = MessageBarType.error;

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('email-text-field', 'email', true);
			SetTextFieldAutocomplete('password-text-field', 'current-password');
		}, 1);
	}

	Login(){
		
	}
}