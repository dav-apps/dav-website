import { Component, HostListener } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import {
	Dav,
	ApiResponse,
	ApiErrorResponse,
	ErrorCodes,
	UsersController
} from 'dav-js'
import {
	DataService,
	SetTextFieldAutocomplete,
	GetUserAgentModel,
	GetUserAgentPlatform
} from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-signup-page',
	templateUrl: './signup-page.component.html'
})
export class SignupPageComponent {
	locale = enUS.signupPage
	firstName: string = ""
	email: string = ""
	password: string = ""
	passwordConfirmation: string = ""
	websiteSignup: boolean = false
	appId: number = 0
	apiKey: string = null
	redirectUrl: string = null
	errorMessage: string = ""
	height: number = 400
	backButtonWidth: number = 40
	signupLoading: boolean = false
	redirectedFromLogin: boolean = false

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().signupPage

		// Check if the user is coming from the login page
		let extras = this.router.getCurrentNavigation().extras;
		if (extras.state && extras.state.redirectedFromLogin) this.redirectedFromLogin = true

		this.appId = +this.activatedRoute.snapshot.queryParamMap.get('appId')
		this.apiKey = this.activatedRoute.snapshot.queryParamMap.get('apiKey')
		
		let encodedRedirectUrl = this.activatedRoute.snapshot.queryParamMap.get('redirectUrl')
		this.redirectUrl = encodedRedirectUrl != null ? decodeURIComponent(encodedRedirectUrl) : null

		// If none of the params are present, this is a normal signup for the website
		this.websiteSignup = this.appId == 0 && this.apiKey == null && this.redirectUrl == null

		if (this.websiteSignup) {
			// Set the appId and apiKey
			this.appId = environment.appId
			this.apiKey = environment.apiKey
		} else {
			// Check if appId, apiKey and redirectUrl are present and valid
			if (
				isNaN(this.appId)
				|| this.appId <= 0
				|| this.apiKey == null
				|| this.apiKey.length < 2
				|| this.redirectUrl == null
				|| this.redirectUrl.length < 2
			) {
				this.RedirectToStartPageWithError()
				return
			}

			this.dataService.hideNavbarAndFooter = true
		}
	}

	ngOnInit() {
		this.setSize()
	}

	ngAfterViewInit() {
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('first-name-textfield', 'given-name')
			SetTextFieldAutocomplete('email-textfield', 'email')
			SetTextFieldAutocomplete('password-textfield', 'new-password')
			SetTextFieldAutocomplete('password-confirmation-textfield', 'new-password')
		}, 1)
	}

	@HostListener('window:resize')
	onResize() {
		this.setSize()
	}

	setSize() {
		this.height = window.innerHeight
		this.backButtonWidth = window.innerWidth < 576 ? 25 : 40
	}

	async Signup() {
		if (this.password != this.passwordConfirmation) {
			this.errorMessage = this.locale.errors.passwordConfirmationNotMatching
			this.passwordConfirmation = ""
			return
		}
		this.errorMessage = ""
		this.signupLoading = true

		// Create the user on the server
		this.SignupResponse(
			await this.websocketService.Emit(WebsocketCallbackType.Signup, {
				email: this.email,
				firstName: this.firstName,
				password: this.password,
				appId: this.appId,
				apiKey: this.apiKey,
				deviceName: await GetUserAgentModel(),
				deviceOs: await GetUserAgentPlatform()
			})
		)
	}

	GoBack() {
		if (this.redirectedFromLogin) {
			// Go back to the login page
			window.history.back()
		} else {
			// Redirect back to the app
			window.location.href = this.redirectUrl
		}
	}

	async SignupResponse(response: (ApiResponse<UsersController.SignupResponseData> | ApiErrorResponse)) {
		if (response.status == 201) {
			let responseData = (response as ApiResponse<UsersController.SignupResponseData>).data

			if (this.websiteSignup) {
				// Log in the user locally
				await Dav.Login(responseData.accessToken)

				// Redirect to the start page
				this.router.navigate(['/'])
			} else {
				// Log in the user locally
				await Dav.Login(responseData.websiteAccessToken)

				// Redirect to the redirect url
				window.location.href = `${this.redirectUrl}?accessToken=${responseData.accessToken}`
			}
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code
			this.errorMessage = this.GetSignupErrorMessage(errorCode)

			if (errorCode == ErrorCodes.PasswordTooShort || errorCode == ErrorCodes.PasswordTooLong) {
				this.password = ""
				this.passwordConfirmation = ""
			}

			// Hide the spinner
			this.signupLoading = false
		}
	}

	GetSignupErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.FirstNameMissing:
				return this.locale.errors.firstNameMissing
			case ErrorCodes.EmailMissing:
				return this.locale.errors.emailMissing
			case ErrorCodes.PasswordMissing:
				return this.locale.errors.passwordMissing
			case ErrorCodes.FirstNameTooShort:
				return this.locale.errors.firstNameTooShort
			case ErrorCodes.PasswordTooShort:
				return this.locale.errors.passwordTooShort
			case ErrorCodes.FirstNameTooLong:
				return this.locale.errors.firstNameTooLong
			case ErrorCodes.PasswordTooLong:
				return this.locale.errors.passwordTooLong
			case ErrorCodes.EmailInvalid:
				return this.locale.errors.emailInvalid
			case ErrorCodes.EmailAlreadyInUse:
				return this.locale.errors.emailTaken
			default:
				return this.locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString())
		}
	}

	RedirectToStartPageWithError() {
		this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong
		this.router.navigate(['/'])
	}
}