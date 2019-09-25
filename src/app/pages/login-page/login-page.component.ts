import { Component } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';

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
		// Set the autocomplete value of the input elements
		setTimeout(() => {
			this.SetEmailInputAutocomplete();
			this.SetPasswordInputAutocomplete();
		}, 1);
	}

	SetEmailInputAutocomplete(){
		// Find the input element
		let emailTextField = document.getElementById('email-text-field');
		let emailInput = this.FindElement(emailTextField, "input");
		emailInput.focus();

		if(emailInput){
			// Set the autocomplete attribute
			emailInput.setAttribute("autocomplete", "email");
		}
	}

	SetPasswordInputAutocomplete(){
		// Find the input element
		let passwordTextField = document.getElementById('password-text-field');
		let passwordInput = this.FindElement(passwordTextField, "input");

		if(passwordInput){
			// Set the autocomplete attribute
			passwordInput.setAttribute("autocomplete", "current-password");
		}
	}

	FindElement(currentElement: Element, tagName: string){
		if(currentElement.tagName.toLowerCase() == tagName) return currentElement;

		for(let i = 0; i < currentElement.children.length; i++){
			let child = currentElement.children.item(i);
			
			let foundElement = this.FindElement(child, tagName);
			if(foundElement) return foundElement;
		}

		return null;
	}

	Login(){
		
	}
}