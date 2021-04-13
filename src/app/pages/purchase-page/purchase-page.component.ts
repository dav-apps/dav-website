import { Component, ViewChild, HostListener } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { IButtonStyles, IIconStyles, SpinnerSize } from 'office-ui-fabric-react'
import {
	Dav,
	ApiResponse,
	ApiErrorResponse,
	ErrorCodes,
	Purchase,
	SessionResponseData,
	PurchasesController
} from 'dav-js'
import { PaymentFormDialogComponent } from 'src/app/components/payment-form-dialog-component/payment-form-dialog.component'
import { DataService, StripeApiResponse, Capitalize } from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'
declare var deviceAPI: any

const deviceInfoNotAvailable = "Not available"

@Component({
	selector: 'dav-website-purchase-page',
	templateUrl: './purchase-page.component.html'
})
export class PurchasePageComponent {
	locale = enUS.purchasePage
	@ViewChild('paymentFormDialog', { static: true }) paymentFormDialog: PaymentFormDialogComponent
	purchase: Purchase = new Purchase(0, 0, 0, "", "", "", "", "", "", 0, "eur", false)
	price: string = ""
	redirectUrl: string
	loginUser: { id: number, firstName: string, email: string, profileImage: string }
	loginPromise: Promise<null> = new Promise(resolve => this.loginPromiseResolve = resolve)
	loginPromiseResolve: Function
	password: string = ""
	loginErrorMessage: string = ""
	loginLoading: boolean = false
	spinnerSize: SpinnerSize = SpinnerSize.small
	addPaymentMethodHover: boolean = false
	hasPaymentMethod: boolean = false
	paymentMethodLast4: string
	paymentMethodExpirationMonth: string
	paymentMethodExpirationYear: string
	mobileView: boolean = false
	paymentLoading: boolean = false

	loginButtonStyles: IButtonStyles = {
		root: {
			marginTop: 24
		}
	}
	backButtonIconStyles: IIconStyles = {
		root: {
			fontSize: 13
		}
	}
	editPaymentMethodButtonStyles: IButtonStyles = {
		root: {
			float: 'right',
			marginBottom: 16
		}
	}

	constructor(
		public dataService: DataService,
		private websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().purchasePage
		this.dataService.hideNavbarAndFooter = true

		this.redirectUrl = this.activatedRoute.snapshot.queryParamMap.get("redirectUrl")
		if (!this.redirectUrl) this.RedirectToStartPageWithError()
	}

	async ngOnInit() {
		this.setSize()
		await this.dataService.userDownloadPromise

		// Get the id from the url
		let purchaseUuid = this.activatedRoute.snapshot.paramMap.get('uuid')

		// Get the purchase from the server
		let response: ApiResponse<Purchase> | ApiErrorResponse = await this.websocketService.Emit(WebsocketCallbackType.GetPurchase, { uuid: purchaseUuid })

		if (response.status == 200) {
			this.purchase = (response as ApiResponse<Purchase>).data
			this.price = (this.purchase.Price / 100).toFixed(2) + " €"

			if (this.dataService.locale.slice(0, 2) == "de") {
				this.price = this.price.replace('.', ',')
			}
		} else {
			// TODO: Redirect back with error
			return
		}

		// Show the Login form if the user is not logged in or if the logged in user is not the user of the purchase
		if (
			!this.dataService.dav.isLoggedIn
			|| this.dataService.dav.user.Id != this.purchase.UserId
		) {
			// Get the user of the purchase
			let getUserByIdResponse = await this.websocketService.Emit(WebsocketCallbackType.GetUserById, { id: this.purchase.UserId })
			if (getUserByIdResponse.status != 200) {
				// TODO: Redirect back with error
				return
			}

			this.loginUser = {
				id: getUserByIdResponse.data.Id,
				firstName: getUserByIdResponse.data.FirstName,
				email: getUserByIdResponse.data.Email,
				profileImage: getUserByIdResponse.data.ProfileImage
			}
		} else {
			this.loginPromiseResolve()
		}

		await this.loginPromise

		// Get the payment method of the user
		await this.GetPaymentMethod()
	}

	@HostListener('window:resize')
	onResize() {
		this.setSize()
	}

	setSize() {
		this.mobileView = window.outerWidth < 768
	}

	async Login() {
		this.loginErrorMessage = ""
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

		let response = await this.websocketService.Emit(WebsocketCallbackType.CreateSession, {
			email: this.loginUser.email,
			password: this.password,
			appId: environment.appId,
			apiKey: environment.apiKey,
			deviceName: fullDeviceName,
			deviceType,
			deviceOs
		})

		if (response.status == 201) {
			// Log the user in
			await Dav.Login((response as ApiResponse<SessionResponseData>).data.accessToken)

			this.loginUser = null
			this.loginPromiseResolve()
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code

			switch (errorCode) {
				case ErrorCodes.IncorrectPassword:
					this.loginErrorMessage = this.locale.errors.loginFailed
					break
				case ErrorCodes.PasswordMissing:
					this.loginErrorMessage = this.locale.errors.passwordMissing
					break
				default:
					this.loginErrorMessage = this.locale.errors.unexpectedError.replace('{0}', errorCode.toString())
					break
			}

			this.password = ""
		}

		this.loginLoading = false
	}

	async GetPaymentMethod() {
		if (this.dataService.dav.user.StripeCustomerId) {
			let paymentMethodResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, { customerId: this.dataService.dav.user.StripeCustomerId })
			this.hasPaymentMethod = paymentMethodResponse.success && paymentMethodResponse.response

			if (this.hasPaymentMethod) {
				this.paymentMethodLast4 = paymentMethodResponse.response.card.last4
				this.paymentMethodExpirationMonth = paymentMethodResponse.response.card.exp_month.toString()
				this.paymentMethodExpirationYear = paymentMethodResponse.response.card.exp_year.toString().substring(2)

				if (this.paymentMethodExpirationMonth.length == 1) {
					this.paymentMethodExpirationMonth = "0" + this.paymentMethodExpirationMonth
				}
			}
		}
	}

	ShowPaymentMethodDialog() {
		this.paymentFormDialog.ShowDialog()
	}

	async PaymentMethodChanged() {
		await this.GetPaymentMethod()
	}

	async Pay() {
		this.paymentLoading = true

		// Complete the purchase on the server
		let completePurchaseResponse: ApiResponse<Purchase> | ApiErrorResponse = await PurchasesController.CompletePurchase({ uuid: this.purchase.Uuid })

		if (completePurchaseResponse.status == 200) {
			// Redirect to the redirect url
			window.location.href = this.redirectUrl
		} else {
			// Redirect back to redirect url with error
			// TODO
		}
	}

	NavigateBack() {
		// Redirect back to the app
		window.location.href = this.redirectUrl
	}

	RedirectToStartPageWithError() {
		this.dataService.startPageErrorMessage = this.locale.errors.unexpectedErrorLong
		this.router.navigate(['/'])
	}
}