import { Component } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { ApiResponse, ApiErrorResponse } from 'dav-js'
import { DataService } from 'src/app/services/data-service'
import { ApiService } from 'src/app/services/api-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-reset-password-page',
	templateUrl: './reset-password-page.component.html'
})
export class ResetPasswordPageComponent {
	locale = enUS.resetPasswordPage
	userId: number = -1
	passwordConfirmationToken: string = ""
	password: string = ""
	passwordConfirmation: string = ""
	loading: boolean = false

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().resetPasswordPage

		this.userId = +this.activatedRoute.snapshot.queryParamMap.get('userId')
		this.passwordConfirmationToken = this.activatedRoute.snapshot.queryParamMap.get('passwordConfirmationToken')

		if (
			isNaN(this.userId)
			|| this.userId <= 0
			|| this.passwordConfirmationToken == null
			|| this.passwordConfirmationToken.length < 3
		) {
			this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong
			this.router.navigate(['/'])
		}
	}

	async SavePassword() {
		if (this.password.length < 7 || this.password.length > 25 || this.password != this.passwordConfirmation) return

		// Send new password to the server
		this.loading = true
		this.SetPasswordResponse(
			await this.apiService.SetPassword({
				id: this.userId,
				password: this.password,
				passwordConfirmationToken: this.passwordConfirmationToken
			})
		)
	}

	async SetPasswordResponse(response: (ApiResponse<{}> | ApiErrorResponse)) {
		if (response.status == 204) {
			this.dataService.startPageSuccessMessage = this.locale.successMessage
		} else {
			this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong
		}
		this.loading = false
		this.router.navigate(['/'])
	}
}