import { Component, HostListener } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageBarType, SpinnerSize } from 'office-ui-fabric-react'
import { ApiResponse, SignupResponseData, LoginResponseData, ApiErrorResponse, Log } from 'dav-npm'
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'
declare var deviceAPI: any

const signupTypeImplicit = "implicit"
const signupTypeSession = "session"
const signupEventName = "signup"
const signupImplicitEventName = "signup_implicit"
const signupSessionEventName = "signup_session"

@Component({
	selector: 'dav-website-signup-page',
	templateUrl: './signup-page.component.html'
})
export class SignupPageComponent{
	locale = enUS.signupPage
	firstName: string = ""
	email: string = ""
	password: string = ""
	passwordConfirmation: string = ""
	signupType: SignupType = SignupType.Normal
	appId: number = -1
	apiKey: string = null
	redirectUrl: string = null
	errorMessage: string = ""
	height: number = 400
	backButtonWidth: number = 40
	messageBarType: MessageBarType = MessageBarType.error
	spinnerSize: SpinnerSize = SpinnerSize.small
	signupLoading: boolean = false
	redirectedFromLogin: boolean = false

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().signupPage;

		// Check if the user is coming from the login page
		let extras = this.router.getCurrentNavigation().extras;
		if(extras.state && extras.state.redirectedFromLogin) this.redirectedFromLogin = true;

		let type = this.activatedRoute.snapshot.queryParamMap.get('type');
		if(!type) return;

		if(type == signupTypeImplicit){
			this.signupType = SignupType.Implicit;
		}else if(type == signupTypeSession){
			this.signupType = SignupType.Session;
		}

		this.appId = +this.activatedRoute.snapshot.queryParamMap.get('app_id');
		this.apiKey = this.activatedRoute.snapshot.queryParamMap.get('api_key');
		this.redirectUrl = decodeURIComponent(this.activatedRoute.snapshot.queryParamMap.get('redirect_url'));

		if(this.signupType == SignupType.Implicit){
			// Check if apiKey and redirectUrl are present
			if(!this.apiKey || this.apiKey.length < 2 || !this.redirectUrl || this.redirectUrl.length < 2) this.RedirectToStartPageWithError();
			else this.dataService.hideNavbarAndFooter = true;
		}else if(this.signupType == SignupType.Session){
			// Check if appId, apiKey and redirectUrl are present
			if(isNaN(this.appId) || this.appId <= 0 || !this.apiKey || this.apiKey.length < 2 || !this.redirectUrl || this.redirectUrl.length < 2) this.RedirectToStartPageWithError();
			else this.dataService.hideNavbarAndFooter = true;
		}
	}

	ngOnInit(){
		this.setSize()
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('first-name-textfield', 'given-name', true)
			SetTextFieldAutocomplete('email-textfield', 'email')
			SetTextFieldAutocomplete('password-textfield', 'new-password')
			SetTextFieldAutocomplete('password-confirmation-textfield', 'new-password')
		}, 1)
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize()
	}

	setSize(){
		this.height = window.innerHeight;
		this.backButtonWidth = window.innerWidth < 576 ? 25 : 40;
	}

	async Signup(){
		if(this.password != this.passwordConfirmation){
			this.errorMessage = this.locale.errors.passwordConfirmationNotMatching;
			this.passwordConfirmation = "";
			return;
		}
		this.errorMessage = "";
		this.signupLoading = true;

		switch (this.signupType) {
			case SignupType.Normal:
				this.SignupResponse(
					await this.websocketService.Emit(WebsocketCallbackType.Signup, {
						username: this.firstName,
						email: this.email,
						password: this.password
					})
				)
				break;
			case SignupType.Implicit:
				this.SignupImplicitResponse(
					await this.websocketService.Emit(WebsocketCallbackType.SignupImplicit, {
						apiKey: this.apiKey,
						username: this.firstName,
						email: this.email,
						password: this.password
					})
				)
				break;
			case SignupType.Session:
				// Get device info
				let deviceName = this.locale.deviceInfoUnknown;
				let deviceType = this.locale.deviceInfoUnknown;
				let deviceOs = this.locale.deviceInfoUnknown;

				if(deviceAPI){
					deviceName = deviceAPI.deviceName;
					deviceType = this.Capitalize(deviceAPI.deviceType as string);
					deviceOs = deviceAPI.osName;

					if(deviceName == "Not available") deviceName = this.locale.deviceInfoUnknown;
					if(deviceType == "Not available") deviceType = this.locale.deviceInfoUnknown;
					if(deviceOs == "Not available") deviceOs = this.locale.deviceInfoUnknown;
				}

				// Create the user on the server
				this.SignupSessionResponse(
					await this.websocketService.Emit(WebsocketCallbackType.SignupSession, {
						username: this.firstName,
						email: this.email,
						password: this.password,
						appId: this.appId,
						apiKey: this.apiKey,
						deviceName,
						deviceType,
						deviceOs
					})
				)
				break;
		}
	}

	GoBack(){
		if(this.redirectedFromLogin){
			// Go back to the login page
			window.history.back();
		}else{
			// Redirect back to the app
			window.location.href = this.redirectUrl;
		}
	}

	async SignupResponse(response: (ApiResponse<SignupResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Save the jwt
			await this.dataService.user.Login((response as ApiResponse<SignupResponseData>).data.jwt);

			// Log the event
			await this.LogEvent(signupEventName);

			// Redirect to the start page
			this.router.navigate(['/']);
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSignupErrorMessage(errorCode);

			if(errorCode == 2202 || errorCode == 2302){
				this.password = "";
				this.passwordConfirmation = "";
			}

			// Hide the spinner
			this.signupLoading = false;
		}
	}

	async SignupImplicitResponse(response: (ApiResponse<LoginResponseData> | ApiErrorResponse)){
		if(response.status == 200){
			// Log the event
			await this.LogEvent(signupImplicitEventName);

			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<LoginResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSignupErrorMessage(errorCode);

			if(errorCode == 2202 || errorCode == 2302){
				this.password = "";
				this.passwordConfirmation = "";
			}

			// Hide the spinner
			this.signupLoading = false;
		}
	}

	async SignupSessionResponse(response: (ApiResponse<SignupResponseData> | ApiErrorResponse)){
		if(response.status == 201){
			// Log the event
			await this.LogEvent(signupSessionEventName);

			// Redirect to the redirect url
			window.location.href = `${this.redirectUrl}?jwt=${(response as ApiResponse<SignupResponseData>).data.jwt}`;
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSignupErrorMessage(errorCode);

			if(errorCode == 2202 || errorCode == 2302){
				this.password = "";
				this.passwordConfirmation = "";
			}

			// Hide the spinner
			this.signupLoading = false;
		}
	}

	GetSignupErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 2105:
				return this.locale.errors.usernameMissing;
			case 2106:
				return this.locale.errors.emailMissing;
			case 2107:
				return this.locale.errors.passwordMissing;
			case 2201:
				return this.locale.errors.usernameTooShort;
			case 2202:
				return this.locale.errors.passwordTooShort;
			case 2301:
				return this.locale.errors.usernameTooLong;
			case 2302:
				return this.locale.errors.passwordTooLong;
			case 2401:
				return this.locale.errors.emailInvalid;
			case 2702:
				return this.locale.errors.emailTaken;
			default:
				return this.locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString());
		}
	}

	RedirectToStartPageWithError(){
		this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong;
		this.router.navigate(['/']);
	}

	async LogEvent(name: string){
		await Log(environment.apiKey, name);
	}

	Capitalize(s: string){
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
}

enum SignupType{
	Normal = 0,
	Implicit = 1,
	Session = 2
}