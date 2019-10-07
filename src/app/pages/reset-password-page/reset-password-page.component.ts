import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const setPasswordKey = "setPassword";

@Component({
	selector: 'dav-website-reset-password-page',
	templateUrl: './reset-password-page.component.html'
})
export class ResetPasswordPageComponent{
	socket: any = null;
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

	ngOnInit(){
		this.socket = io();
		this.socket.on(setPasswordKey, (response: (ApiResponse<{}> | ApiErrorResponse)) => this.SetPasswordResponse(response));
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('password-text-field', 'new-password', true);
			SetTextFieldAutocomplete('password-confirmation-text-field', 'new-password');
		}, 1);
	}

	SavePassword(){
		if(this.password.length < 7 || this.password.length > 25 || this.password != this.passwordConfirmation) return;
		
		// Send new password to the server
		this.socket.emit(setPasswordKey, {
			userId: this.userId,
			passwordConfirmationToken: this.passwordConfirmationToken,
			password: this.password
		});
	}

	async SetPasswordResponse(response: (ApiResponse<{}> | ApiErrorResponse)){
		if(response.status == 200){
			this.dataService.startPageSuccessMessage = "You can now log in with your new password";
		}else{
			this.dataService.startPageErrorMessage = "There was an error with changing your password. Please try it again."
		}
		this.router.navigate(['/']);
	}
}