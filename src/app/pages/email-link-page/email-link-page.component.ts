import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
declare var io: any;

const saveNewPasswordKey = "saveNewPassword";

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

		switch (type) {
			case "change_password":
				// Get user id and password confirmation token
				let userId = +this.activatedRoute.snapshot.queryParamMap.get('user_id');
				let passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('password_confirmation_token');

				if(isNaN(userId) || userId <= 0 || !passwordConfirmationToken || passwordConfirmationToken.length < 2) this.RedirectToStartPageWithError();
				else this.HandleChangePassword(userId, passwordConfirmationToken);
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

	SaveNewPasswordResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess("You can now log in with your new password");
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