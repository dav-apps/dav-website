import { Component, HostListener } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { ApiResponse, ApiErrorResponse } from 'dav-js'
import { DataService } from 'src/app/services/data-service'
import { ApiService } from 'src/app/services/api-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-email-link-page',
	templateUrl: "./email-link-page.component.html"
})
export class EmailLinkPageComponent {
	locale = enUS.emailLinkPage
	height: number = 500

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().emailLinkPage

		this.dataService.showNavbar = false
		this.dataService.showFooter = false
		this.setSize()

		let type = this.activatedRoute.snapshot.queryParamMap.get('type')

		if (type == null) {
			// Redirect to the start page
			this.RedirectToStartPageWithError()
			return
		}

		// Get all possible variables from the url params
		let userId = +this.activatedRoute.snapshot.queryParamMap.get('userId')
		let passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('passwordConfirmationToken')
		let emailConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('emailConfirmationToken')

		switch (type) {
			case "confirmUser":
				// Check if user id and email confirmation token are present
				if (
					isNaN(userId)
					|| userId <= 0
					|| emailConfirmationToken == null
					|| emailConfirmationToken.length < 2
				) this.RedirectToStartPageWithError()
				else this.HandleConfirmUser(userId, emailConfirmationToken)
				break
			case "changeEmail":
				// Check if user id and email confirmation token are present
				if (
					isNaN(userId)
					|| userId <= 0
					|| emailConfirmationToken == null
					|| emailConfirmationToken.length < 2
				) this.RedirectToStartPageWithError()
				else this.HandleChangeEmail(userId, emailConfirmationToken)
				break
			case "changePassword":
				// Check if user id and password confirmation token are present
				if (
					isNaN(userId)
					|| userId <= 0
					|| passwordConfirmationToken == null
					|| passwordConfirmationToken.length < 2
				) this.RedirectToStartPageWithError()
				else this.HandleChangePassword(userId, passwordConfirmationToken)
				break
			case "resetEmail":
				// Check if user id and email confirmation token are present
				if (
					isNaN(userId)
					|| userId <= 0
					|| emailConfirmationToken == null
					|| emailConfirmationToken.length < 2
				) this.RedirectToStartPageWithError()
				else this.HandleResetNewEmail(userId, emailConfirmationToken)
				break
			default:
				this.RedirectToStartPageWithError()
		}
	}

	@HostListener('window:resize')
	setSize() {
		this.height = window.innerHeight
	}

	async HandleConfirmUser(userId: number, emailConfirmationToken: string) {
		this.ConfirmUserResponse(
			await this.apiService.ConfirmUser({
				id: userId,
				emailConfirmationToken
			})
		)
	}

	async HandleChangePassword(userId: number, passwordConfirmationToken: string) {
		this.SaveNewPasswordResponse(
			await this.apiService.SaveNewPassword({
				id: userId,
				passwordConfirmationToken
			})
		)
	}

	async HandleChangeEmail(userId: number, emailConfirmationToken: string) {
		this.SaveNewEmailResponse(
			await this.apiService.SaveNewEmail({
				id: userId,
				emailConfirmationToken
			})
		)
	}

	async HandleResetNewEmail(userId: number, emailConfirmationToken: string) {
		this.ResetEmailResponse(
			await this.apiService.ResetEmail({
				id: userId,
				emailConfirmationToken
			})
		)
	}

	ConfirmUserResponse(response: ApiResponse<{}> | ApiErrorResponse) {
		if (response.status == 204) {
			this.RedirectToStartPageWithSuccess(this.locale.confirmUserMessage)
		} else {
			this.RedirectToStartPageWithError()
		}
	}

	SaveNewPasswordResponse(response: ApiResponse<{}> | ApiErrorResponse) {
		if (response.status == 204) {
			this.RedirectToStartPageWithSuccess(this.locale.saveNewPasswordMessage)
		} else {
			this.RedirectToStartPageWithError()
		}
	}

	SaveNewEmailResponse(response: ApiResponse<{}> | ApiErrorResponse) {
		if (response.status == 204) {
			this.RedirectToStartPageWithSuccess(this.locale.saveNewEmailMessage)
		} else {
			this.RedirectToStartPageWithError()
		}
	}

	ResetEmailResponse(response: ApiResponse<{}> | ApiErrorResponse) {
		if (response.status == 204) {
			this.RedirectToStartPageWithSuccess(this.locale.resetNewEmailMessage)
		} else {
			this.RedirectToStartPageWithError()
		}
	}

	RedirectToStartPageWithSuccess(message: string) {
		this.dataService.startPageSuccessMessage = message
		this.router.navigate(['/'])
	}

	RedirectToStartPageWithError() {
		this.dataService.startPageErrorMessage = this.locale.errorMessage
		this.router.navigate(['/'])
	}
}