import { Component } from '@angular/core';
import { SetTextFieldAutocomplete } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-password-reset-page',
	templateUrl: './password-reset-page.component.html'
})
export class PasswordResetPageComponent{
	email: string = "";

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input element
		setTimeout(() => {
			SetTextFieldAutocomplete('email-text-field', 'email', true);
		}, 1);
	}

	SendPasswordResetEmail(){
		console.log("Hello World")
	}
}