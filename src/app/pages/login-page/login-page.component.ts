import { Component, HostListener } from '@angular/core'
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router'
import { MessageBarType, IButtonStyles, SpinnerSize } from 'office-ui-fabric-react'
import {
	Dav,
	ApiResponse,
	ApiErrorResponse,
	ErrorCodes,
	SessionResponseData
} from 'dav-js'
import {
	DataService,
	SetTextFieldAutocomplete,
	Capitalize
} from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'
declare var deviceAPI: any

const deviceInfoNotAvailable = "Not available"

@Component({
	selector: 'dav-website-login-page',
	templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
	locale = enUS.loginPage
	websiteLogin: boolean = true
	loginCompleted: boolean = false
	email: string = ""
	password: string = ""
	errorMessage: string = ""
	appId: number = 0
	apiKey: string
	redirectUrl: string
	redirect: string
	loginLoading: boolean = false
	height: number = 400
	backButtonWidth: number = 40
	spinnerSize: SpinnerSize = SpinnerSize.small
	messageBarType: MessageBarType = MessageBarType.error

	loginButtonStyles: IButtonStyles = {
		root: {
			marginTop: 24
		}
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().loginPage

		this.appId = +this.activatedRoute.snapshot.queryParamMap.get("appId")
		this.apiKey = this.activatedRoute.snapshot.queryParamMap.get("apiKey")
		let redirectUrl = this.activatedRoute.snapshot.queryParamMap.get("redirectUrl")
		if (redirectUrl) this.redirectUrl = decodeURIComponent(redirectUrl).trim()
		let redirect = this.activatedRoute.snapshot.queryParamMap.get("redirect")
		if (redirect) this.redirect = decodeURIComponent(redirect).trim()

		// If none of the params are present, this is a normal login for the website
		this.websiteLogin = this.appId == 0 && this.apiKey == null && this.redirectUrl == null

		if (this.websiteLogin) {
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

	async ngOnInit() {
		this.setSize()
		await this.dataService.userPromise

		if (this.dataService.dav.isLoggedIn && this.websiteLogin) {
			if (this.redirect != null) {
				// Redirect to the redirect url
				this.router.navigateByUrl(this.redirect)
			} else {
				// Redirect to the start page
				this.router.navigate(['/'])
			}
		}
	}

	ngAfterViewInit() {
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('email-text-field', 'email', true)
			SetTextFieldAutocomplete('password-text-field', 'current-password')
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

	async Login() {
		this.errorMessage = ""
		this.loginLoading = true

		// Get device info
		let deviceBrand = this.locale.deviceInfoUnknown
		let deviceName = this.locale.deviceInfoUnknown
		let fullDeviceName = this.locale.deviceInfoUnknown
		let deviceType = this.locale.deviceInfoUnknown
		let deviceOs = this.locale.deviceInfoUnknown

		if (deviceAPI) {
			deviceBrand = deviceAPI.deviceBrand
			deviceName = deviceAPI.deviceName
			deviceType = Capitalize(deviceAPI.deviceType as string)
			deviceOs = deviceAPI.osName

			if (deviceBrand == deviceInfoNotAvailable && deviceName != deviceInfoNotAvailable) {
				fullDeviceName = deviceName
			} else if (deviceBrand != deviceInfoNotAvailable && deviceName == deviceInfoNotAvailable) {
				fullDeviceName = deviceBrand
			} else if (deviceBrand != deviceInfoNotAvailable && deviceName != deviceInfoNotAvailable) {
				fullDeviceName = `${deviceBrand} ${deviceName}`
			}

			if (deviceType == deviceInfoNotAvailable) deviceType = this.locale.deviceInfoUnknown
			if (deviceOs == deviceInfoNotAvailable) deviceOs = this.locale.deviceInfoUnknown
		}

		// Create the session on the server
		this.CreateSessionResponse(
			await this.websocketService.Emit(WebsocketCallbackType.CreateSession, {
				email: this.email,
				password: this.password,
				appId: this.appId,
				apiKey: this.apiKey,
				deviceName: fullDeviceName,
				deviceType,
				deviceOs
			})
		)
	}

	async LoginAsLoggedInUser() {
		// Get device info
		let deviceName = this.locale.deviceInfoUnknown
		let deviceType = this.locale.deviceInfoUnknown
		let deviceOs = this.locale.deviceInfoUnknown

		if (deviceAPI) {
			deviceName = deviceAPI.deviceName
			deviceType = Capitalize(deviceAPI.deviceType as string)
			deviceOs = deviceAPI.osName

			if (deviceName == deviceInfoNotAvailable) deviceName = this.locale.deviceInfoUnknown
			if (deviceType == deviceInfoNotAvailable) deviceType = this.locale.deviceInfoUnknown
			if (deviceOs == deviceInfoNotAvailable) deviceOs = this.locale.deviceInfoUnknown
		}

		// Create the session on the server
		this.CreateSessionWithAccessTokenResponse(
			await this.websocketService.Emit(WebsocketCallbackType.CreateSessionFromAccessToken, {
				accessToken: Dav.accessToken,
				appId: this.appId,
				apiKey: this.apiKey,
				deviceName,
				deviceType,
				deviceOs
			})
		)
	}

	GoBack() {
		// Redirect back to the app
		window.location.href = this.redirectUrl
	}

	async CreateSessionResponse(response: (ApiResponse<SessionResponseData> | ApiErrorResponse)) {
		if (response.status == 201) {
			this.loginCompleted = true
			let responseData = (response as ApiResponse<SessionResponseData>).data

			if (this.websiteLogin) {
				// Log in the user
				await Dav.Login(responseData.accessToken)

				// Redirect to the start page
				this.router.navigate(['/'])
			} else {
				// Log in the user
				await Dav.Login(responseData.websiteAccessToken)

				// Redirect to the redirect url
				window.location.href = `${this.redirectUrl}?accessToken=${responseData.accessToken}`
			}
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code
			this.errorMessage = this.GetLoginErrorMessage(errorCode)

			if (errorCode != ErrorCodes.EmailMissing) {
				this.password = ""
			}

			// Hide the spinner
			this.loginLoading = false
		}
	}

	async CreateSessionWithAccessTokenResponse(response: (ApiResponse<SessionResponseData> | ApiErrorResponse)) {
		if (response.status == 201) {
			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?accessToken=${(response as ApiResponse<SessionResponseData>).data.accessToken}`
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code
			this.errorMessage = this.GetLoginErrorMessage(errorCode)
		}
	}

	GetLoginErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.IncorrectPassword:
				return this.locale.errors.loginFailed
			case ErrorCodes.EmailMissing:
				return this.locale.errors.emailMissing
			case ErrorCodes.PasswordMissing:
				return this.locale.errors.passwordMissing
			case ErrorCodes.UserDoesNotExist:
				return this.locale.errors.loginFailed
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
		}
	}

	RedirectToStartPageWithError() {
		this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong
		this.router.navigate(['/'])
	}

	NavigateToSignup() {
		let extras: NavigationExtras = {
			state: {
				redirectedFromLogin: true
			}
		}

		this.router.navigateByUrl(`/signup?api_key=${this.apiKey}&app_id=${this.appId}&redirect_url=${this.redirectUrl}`, extras)
	}
}