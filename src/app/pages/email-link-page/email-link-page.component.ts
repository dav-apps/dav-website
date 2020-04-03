import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-email-link-page',
	templateUrl: "./email-link-page.component.html"
})
export class EmailLinkPageComponent{
	locale = enUS.emailLinkPage;
	spinnerSize: SpinnerSize = SpinnerSize.large;
	height: number = 500;

	constructor(
		public dataService: DataService,
		private websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().emailLinkPage;

		this.dataService.hideNavbarAndFooter = true;
		this.setSize();

		let type = this.activatedRoute.snapshot.queryParamMap.get('type');

		if(!type){
			// Redirect to the start page
			this.RedirectToStartPageWithError();
			return;
		}

		// Get all possible variables from the url params
		let userId = +this.activatedRoute.snapshot.queryParamMap.get('user_id');
		let appId = +this.activatedRoute.snapshot.queryParamMap.get("app_id");
		let passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('password_confirmation_token');
		let emailConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('email_confirmation_token');

		switch (type) {
			case "delete_user":
				// Check if user id, email confirmation token and password confirmation token are present
				if(isNaN(userId) || userId <= 0 || !emailConfirmationToken || emailConfirmationToken.length < 2 || !passwordConfirmationToken || passwordConfirmationToken.length < 2) this.RedirectToStartPageWithError();
				else this.HandleDeleteUser(userId, emailConfirmationToken, passwordConfirmationToken);
				break;
			case "remove_app":
				// Check if app_id, user_id and password_confirmation_token are present
				if(isNaN(appId) || appId <= 0 || isNaN(userId) || userId <= 0 || !passwordConfirmationToken || passwordConfirmationToken.length < 2) this.RedirectToStartPageWithError();
				else this.HandleRemoveApp(appId, userId, passwordConfirmationToken);
				break;
			case "confirm_user":
				// Check if user id and email confirmation token are present
				if(isNaN(userId) || userId <= 0 || !emailConfirmationToken || emailConfirmationToken.length < 2) this.RedirectToStartPageWithError();
				else this.HandleConfirmUser(userId, emailConfirmationToken);
				break;
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

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}
	
	setSize(){
		this.height = window.innerHeight;
	}

	async HandleDeleteUser(userId: number, emailConfirmationToken: string, passwordConfirmationToken: string){
		this.DeleteUserResponse(
			await this.websocketService.Emit(WebsocketCallbackType.DeleteUser, {
				userId,
				emailConfirmationToken,
				passwordConfirmationToken
			})
		)
	}

	async HandleRemoveApp(appId: number, userId: number, passwordConfirmationToken: string){
		this.RemoveAppResponse(
			await this.websocketService.Emit(WebsocketCallbackType.RemoveApp, {
				appId,
				userId,
				passwordConfirmationToken
			})
		)
	}

	async HandleConfirmUser(userId: number, emailConfirmationToken: string){
		this.ConfirmUserResponse(
			await this.websocketService.Emit(WebsocketCallbackType.ConfirmUser, {
				userId,
				emailConfirmationToken
			})
		)
	}

	async HandleChangePassword(userId: number, passwordConfirmationToken: string){
		this.SaveNewPasswordResponse(
			await this.websocketService.Emit(WebsocketCallbackType.SaveNewPassword, {
				userId,
				passwordConfirmationToken
			})
		)
	}

	async HandleChangeEmail(userId: number, emailConfirmationToken: string){
		this.SaveNewEmailResponse(
			await this.websocketService.Emit(WebsocketCallbackType.SaveNewEmail, {
				userId,
				emailConfirmationToken
			})
		)
	}

	async HandleResetNewEmail(userId: number){
		this.ResetNewEmailResponse(
			await this.websocketService.Emit(WebsocketCallbackType.ResetNewEmail, {userId})
		)
	}

	async DeleteUserResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			await this.dataService.userDownloadPromise;

			// Log out the user
			await this.dataService.user.Logout();
			this.RedirectToStartPageWithSuccess(this.locale.deleteUserMessage);
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	RemoveAppResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess(this.locale.removeAppMessage);
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	ConfirmUserResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess(this.locale.confirmUserMessage);
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	SaveNewPasswordResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess(this.locale.saveNewPasswordMessage);
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	SaveNewEmailResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess(this.locale.saveNewEmailMessage);
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	ResetNewEmailResponse(response: ApiResponse<{}> | ApiErrorResponse){
		if(response.status == 200){
			this.RedirectToStartPageWithSuccess(this.locale.resetNewEmailMessage);
		}else{
			this.RedirectToStartPageWithError();
		}
	}

	RedirectToStartPageWithSuccess(message: string){
		this.dataService.hideNavbarAndFooter = false;
		this.dataService.startPageSuccessMessage = message;
		this.router.navigate(['/']);
	}

	RedirectToStartPageWithError(){
		this.dataService.hideNavbarAndFooter = false;
		this.dataService.startPageErrorMessage = this.locale.errorMessage;
		this.router.navigate(['/']);
	}
}