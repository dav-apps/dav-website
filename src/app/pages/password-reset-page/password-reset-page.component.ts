import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { ApiResponse, ApiErrorResponse, ErrorCodes } from 'dav-js'
import { DataService } from 'src/app/services/data-service'
import { ApiService } from 'src/app/services/api-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-password-reset-page',
	templateUrl: './password-reset-page.component.html'
})
export class PasswordResetPageComponent {
	locale = enUS.passwordResetPage
	email: string = ""
	errorMessage: string = ""
	loading: boolean = false

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private router: Router
	) {
		this.locale = this.dataService.GetLocale().passwordResetPage
	}

	async SendPasswordResetEmail() {
		if (this.email.length < 3 || !this.email.includes('@')) {
			this.errorMessage = this.locale.errors.emailInvalid
			return
		}

		this.errorMessage = ""
		this.loading = true
		this.SendPasswordResetEmailResponse(
			await this.apiService.SendPasswordResetEmail({
				email: this.email
			})
		)
	}

	SendPasswordResetEmailResponse(response: ApiResponse<{}> | ApiErrorResponse) {
		if (response.status == 204) {
			// Redirect to start page and show message
			this.dataService.startPageSuccessMessage = this.locale.successMessage
			this.router.navigate(['/'])
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code
			this.errorMessage = this.GetSendPasswordResetEmailErrorMessage(errorCode)
		}

		// Hide the spinner
		this.loading = false
	}

	GetSendPasswordResetEmailErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.UserDoesNotExist:
				return this.locale.errors.userNotFound
			default:
				return this.locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString())
		}
	}
}