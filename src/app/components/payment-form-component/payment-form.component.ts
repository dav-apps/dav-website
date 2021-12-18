import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core'
import {
	ApiResponse,
	ApiErrorResponse,
	UsersController,
	CreateStripeCustomerForUserResponseData
} from 'dav-js'
import { DataService } from 'src/app/services/data-service'
import { ApiService } from 'src/app/services/api-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'
declare var Stripe: any

@Component({
	selector: 'dav-website-payment-form',
	templateUrl: './payment-form.component.html',
	styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent {
	locale = enUS.paymentFormComponent
	@Input() showSaveButton: boolean = true
	@Output() completed = new EventEmitter()
	@Output() loadingStart = new EventEmitter()
	@Output() loadingEnd = new EventEmitter()
	stripe: any
	elements: any
	card: any
	cardHandler = this.onChange.bind(this)
	errorMessage: string = ""
	cardInputComplete: boolean = false
	loading: boolean = false

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private cd: ChangeDetectorRef
	) {
		this.locale = this.dataService.GetLocale().paymentFormComponent
	}

	ngOnDestroy() {
		if (this.card) {
			this.card.removeEventListener('change', this.cardHandler)
			this.card.destroy()
		}
	}

	Init() {
		this.stripe = Stripe(environment.stripePublishableKey)
		this.elements = this.stripe.elements()

		this.card = this.elements.create('card')
		this.card.mount("#card-element")

		this.card.addEventListener('change', this.cardHandler)
	}

	onChange(event: any) {
		this.cardInputComplete = event.complete

		if (event.error) {
			this.errorMessage = event.error.message
		} else {
			this.errorMessage = ""
		}

		this.cd.detectChanges()
	}

	async SaveCard() {
		if (!this.cardInputComplete) return

		if (!this.loading) {
			this.loadingStart.emit()
			this.loading = true
		}

		// Create a stripe customer if the user has no stripe customer
		if (!this.dataService.dav.user.StripeCustomerId) {
			let createStripeCustomerForUserResponse: ApiResponse<CreateStripeCustomerForUserResponseData> | ApiErrorResponse = await UsersController.CreateStripeCustomerForUser()

			if (createStripeCustomerForUserResponse.status == 201) {
				this.dataService.dav.user.StripeCustomerId = (createStripeCustomerForUserResponse as ApiResponse<CreateStripeCustomerForUserResponseData>).data.stripeCustomerId
				await this.CreatePaymentMethod()
			} else {
				// Show error message
				this.errorMessage = this.locale.unexpectedError.replace('{0}', (createStripeCustomerForUserResponse as ApiErrorResponse).errors[0].code.toString())
			}
		} else {
			await this.CreatePaymentMethod()
		}
	}

	async CreatePaymentMethod() {
		let result = await this.stripe.createPaymentMethod('card', this.card)

		if (result.error) {
			// Show error
			this.errorMessage = result.error.message
		} else {
			if (!this.loading) {
				this.loadingStart.emit()
				this.loading = true
			}

			// Send the payment method to the server
			let saveStripePaymentMethodResponse = await this.apiService.SaveStripePaymentMethod({
				paymentMethodId: result.paymentMethod.id,
				customerId: this.dataService.dav.user.StripeCustomerId
			})

			if (saveStripePaymentMethodResponse.success) {
				this.completed.emit()
			} else {
				// Show error
				this.errorMessage = this.locale.unexpectedError.replace('{0}', saveStripePaymentMethodResponse.response.code)
			}

			if (this.loading) {
				this.loadingEnd.emit()
				this.loading = false
			}
		}
	}
}