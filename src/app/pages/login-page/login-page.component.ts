import { Component } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';
import { SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

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

	ngOnInit(){
		this.socket = io();

		this.socket.emit("login", {hello: "Hello World"});
	}

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