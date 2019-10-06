import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';

@Component({
	selector: 'dav-website-reset-password-page',
	templateUrl: './reset-password-page.component.html'
})
export class ResetPasswordPageComponent{
	userId: number = -1;
	passwordConfirmationToken: string = "";
	password: string = "";
	passwordConfirmation: string = "";

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.userId = +this.activatedRoute.snapshot.queryParamMap.get('user_id');
		this.passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('password_confirmation_token');

		if((this.userId <= 0 || isNaN(this.userId)) || this.passwordConfirmationToken.length < 3){
			this.dataService.startPageErrorMessage = "There was an error. Please try again."
			this.router.navigate(['/']);
		}
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('password-text-field', 'new-password', true);
			SetTextFieldAutocomplete('password-confirmation-text-field', 'new-password');
		}, 1);
	}

	SavePassword(){
		if(this.password.length < 7 || this.password != this.passwordConfirmation) return;
		
		// TODO: Send new password to the server
	}
}