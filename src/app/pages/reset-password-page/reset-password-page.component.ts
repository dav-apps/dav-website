import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-reset-password-page',
	templateUrl: './reset-password-page.component.html'
})
export class ResetPasswordPageComponent{
	locale = enUS.resetPasswordPage;
	setPasswordSubscriptionKey: number;
	userId: number = -1;
	passwordConfirmationToken: string = "";
	password: string = "";
	passwordConfirmation: string = "";
	loading: boolean = false;
	spinnerSize: SpinnerSize = SpinnerSize.small;

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().resetPasswordPage;

		this.userId = +this.activatedRoute.snapshot.queryParamMap.get('user_id');
		this.passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('password_confirmation_token');

		if(isNaN(this.userId) || this.userId <= 0 || !this.passwordConfirmationToken || this.passwordConfirmationToken.length < 3){
			this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong;
			this.router.navigate(['/']);
		}
	}

	ngOnInit(){
		this.setPasswordSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.SetPassword, (response: (ApiResponse<{}> | ApiErrorResponse)) => this.SetPasswordResponse(response));
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('password-text-field', 'new-password', true);
			SetTextFieldAutocomplete('password-confirmation-text-field', 'new-password');
		}, 1);
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.setPasswordSubscriptionKey);
	}

	SavePassword(){
		if(this.password.length < 7 || this.password.length > 25 || this.password != this.passwordConfirmation) return;
		
		// Send new password to the server
		this.loading = true;
		this.websocketService.Emit(WebsocketCallbackType.SetPassword, {
			userId: this.userId,
			passwordConfirmationToken: this.passwordConfirmationToken,
			password: this.password
		});
	}

	async SetPasswordResponse(response: (ApiResponse<{}> | ApiErrorResponse)){
		if(response.status == 200){
			this.dataService.startPageSuccessMessage = this.locale.successMessage;
		}else{
			this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong
		}
		this.loading = false;
		this.router.navigate(['/']);
	}
}