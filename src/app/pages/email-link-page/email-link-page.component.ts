import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
declare var io: any;

const saveNewPasswordKey = "saveNewPassword";
const saveNewEmailKey = "saveNewEmail";
const resetNewEmailKey = "resetNewEmail";

@Component({
	selector: 'dav-website-email-link-page',
	templateUrl: "./email-link-page.component.html"
})
export class EmailLinkPageComponent{
	socket: any = null;

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		let type = this.activatedRoute.snapshot.queryParamMap.get('type');

		if(!type){
			// Redirect to the start page
			this.RedirectToStartPageWithError();
			return;
		}

		this.socket = io();
		this.socket.on(saveNewPasswordKey, (response: ApiResponse<{}> | ApiErrorResponse) => this.SaveNewPasswordResponse(response));
		this.socket.on(saveNewEmailKey, (response: ApiResponse<{}> | ApiErrorResponse) => this.SaveNewEmailResponse(response));
		this.socket.on(resetNewEmailKey, (response: ApiResponse<{}> | ApiErrorResponse) => this.ResetNewEmailResponse(response));

		// Get all possible variables from the url params
		let userId = +this.activatedRoute.snapshot.queryParamMap.get('user_id');
		let passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('password_confirmation_token');
		let emailConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('email_confirmation_token');

		switch (type) {
			case "change_password":
				// Check if user id and password confirmation token are present
				if(isNaN(userId) || userId <= 0 || !passwordConfirmationToken || passwordConfirmationToken.length < 2) this.RedirectToStartPageWithError();
				else this.HandleChangePassword(userId, passwordConfirmationToken);
				break;
			case "change_email":
				// Check if user id and email confirmation token are present
				if(isNaN(userId) || userId <= 0 || !emailConfirmationToken || emailConfirmationToken.length < 2) this.RedirectToStartPageWithError();
				else this.HandleChangeEmail(userId, emailConfirmationToken);
				break;
			case "reset_new_email":
				// Check if user id is present
				if(isNaN(userId) || userId <= 0) this.RedirectToStartPageWithError();
				else this.HandleResetNewEmail(userId);
				break;
			default:
				this.RedirectToStartPageWithError();
		}
	}

	HandleChangePassword(userId: number, passwordConfirmationToken: string){
		this.socket.emit(saveNewPasswordKey, {
			userId,
			passwordConfirmationToken
		});
	}

	HandleChangeEmail(userId: number, emailConfirmationToken: string){
		this.socket.emit(saveNewEmailKey, {
			userId,
			emailConfirmationToken
		});
	}

	HandleResetNewEmail(userId: number){
		this.socket.emit(resetNewEmailKey, {userId});
	}

	SaveNewPasswordResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess("You can now log in with your new password");
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	SaveNewEmailResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess("You can now log in with your new email address");
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	ResetNewEmailResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess("The email change was canceled. You can now log in with your old email");
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	RedirectToStartPageWithSuccess(message: string){
		this.dataService.startPageSuccessMessage = message;
		this.router.navigate(['/']);
	}

	RedirectToStartPageWithError(){
		this.dataService.startPageErrorMessage = "There was an error. Please try again.";
		this.router.navigate(['/']);
	}
}