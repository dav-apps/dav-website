import { Component, ViewChild } from '@angular/core'
import { SubscriptionStatus } from 'dav-js'
import { DataService, StripeApiResponse } from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'
import { PaymentFormDialogComponent } from '../payment-form-dialog-component/payment-form-dialog.component'
import * as moment from 'moment'

@Component({
	selector: 'dav-website-pricing',
	templateUrl: './pricing.component.html'
})
export class PricingComponent {
	locale = enUS.pricingComponent
	@ViewChild('paymentFormDialog', { static: true }) paymentFormDialog: PaymentFormDialogComponent
	selectedPlan: number = -1
	errorMessage: string = ""
	successMessage: string = ""
	paymentMethod: Promise<any> = new Promise((resolve) => this.paymentMethodResolve = resolve)
	paymentMethodResolve: Function
	paymentMethodLast4: string
	paymentMethodExpirationMonth: string
	paymentMethodExpirationYear: string
	editPaymentMethod: boolean = false
	periodEndDate: string
	continueOrCancelSubscriptionLoading: boolean = false
	freePlanLoading: boolean = false
	plusPlanLoading: boolean = false
	proPlanLoading: boolean = false
	changePlanDialogVisible: boolean = false
	changePlanDialogTitle: string = this.locale.changePlanDialog.upgradePlusTitle
	changePlanDialogDescription: string = this.locale.changePlanDialog.upgradePlusDescription

	constructor(
		public dataService: DataService,
		private websocketService: WebsocketService
	) {
		this.locale = this.dataService.GetLocale().pricingComponent
		moment.locale(this.dataService.locale)
	}

	ngOnInit() {
		this.UpdateSubscriptionDetails()
	}

	async PlanButtonClick(plan: number) {
		this.selectedPlan = plan
		let paymentMethod = await this.paymentMethod

		if (!paymentMethod) {
			// Show the payment form
			this.editPaymentMethod = false
			this.paymentFormDialog.ShowDialog()
		} else {
			// Update the values of the change plan dialog
			switch (this.selectedPlan) {
				case 2:
					// upgradePro
					this.changePlanDialogTitle = this.locale.changePlanDialog.upgradeProTitle
					this.changePlanDialogDescription = this.locale.changePlanDialog.upgradeProDescription
					break
				case 1:
					if (this.dataService.dav.user.Plan == 2) {
						// downgradePlus
						this.changePlanDialogTitle = this.locale.changePlanDialog.downgradePlusTitle
						this.changePlanDialogDescription = this.locale.changePlanDialog.downgradePlusDescription
					} else {
						// upgradePlus
						this.changePlanDialogTitle = this.locale.changePlanDialog.upgradePlusTitle
						this.changePlanDialogDescription = this.locale.changePlanDialog.upgradePlusDescription
					}
					break
				default:
					// downgradeFree
					this.changePlanDialogTitle = this.locale.changePlanDialog.downgradeFreeTitle
					this.changePlanDialogDescription = this.locale.changePlanDialog.downgradeFreeDescription
					break
			}

			// Show the upgrade dialog
			this.changePlanDialogVisible = true
		}
	}

	EditPaymentMethodClick() {
		this.editPaymentMethod = true
		this.paymentFormDialog.ShowDialog()
	}

	async ContinueOrCancelButtonClick() {
		this.continueOrCancelSubscriptionLoading = true

		this.SetStripeSubscriptionCancelledResponse(
			await this.websocketService.Emit(WebsocketCallbackType.SetStripeSubscriptionCancelled, {
				customerId: this.dataService.dav.user.StripeCustomerId,
				cancel: this.dataService.dav.user.SubscriptionStatus == 0
			})
		)
	}

	async PaymentMethodInputCompleted() {
		if (!this.editPaymentMethod) {
			await this.SetStripeSubscription()
		} else {
			this.errorMessage = ""
			this.successMessage = this.locale.changePaymentMethodSuccessMessage
		}

		// Get the new payment method from the server
		this.UpdateSubscriptionDetails()
	}

	async SetStripeSubscription() {
		this.changePlanDialogVisible = false
		switch (this.selectedPlan) {
			case 0:
				this.freePlanLoading = true
				this.plusPlanLoading = false
				this.proPlanLoading = false
				break
			case 1:
				this.freePlanLoading = false
				this.plusPlanLoading = true
				this.proPlanLoading = false
				break
			case 2:
				this.freePlanLoading = false
				this.plusPlanLoading = false
				this.proPlanLoading = true
				break
		}

		let planId = null
		if (this.selectedPlan == 1) planId = environment.stripeDavPlusEurPlanId
		else if (this.selectedPlan == 2) planId = environment.stripeDavProEurPlanId

		this.SetStripeSubscriptionResponse(
			await this.websocketService.Emit(WebsocketCallbackType.SetStripeSubscription, {
				customerId: this.dataService.dav.user.StripeCustomerId,
				planId
			})
		)
	}

	async UpdateSubscriptionDetails() {
		await this.dataService.userPromise

		// Get the payment method
		if (this.dataService.dav.isLoggedIn && this.dataService.dav.user.StripeCustomerId != null) {
			this.GetStripePaymentMethodResponse(
				await this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, { customerId: this.dataService.dav.user.StripeCustomerId })
			)
		} else {
			this.paymentMethodResolve()
		}

		if (this.dataService.dav.user.Plan > 0 && this.dataService.dav.user.PeriodEnd) {
			// Show the date of the next payment or the subscription end
			this.periodEndDate = moment(this.dataService.dav.user.PeriodEnd).format('LL')
		}
	}

	SetStripeSubscriptionResponse(message: StripeApiResponse) {
		if (message.success) {
			if (this.selectedPlan == 0) {
				// Set the subscription status of the user
				this.errorMessage = ""
				this.successMessage = this.locale.cancelSubscriptionSuccessMessage.replace('{0}', this.periodEndDate)
				this.dataService.dav.user.SubscriptionStatus = SubscriptionStatus.Ending
			} else {
				// Set the plan of the user
				this.errorMessage = ""
				this.successMessage = this.locale.changePlanSuccessMessage
				this.dataService.dav.user.Plan = this.selectedPlan
			}
			
			// Show the date of the next payment or the subscription end
			this.dataService.dav.user.PeriodEnd = new Date(message.response.current_period_end * 1000)
			this.periodEndDate = moment(this.dataService.dav.user.PeriodEnd).format('LL')
		} else {
			// Show error
			this.successMessage = ""
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code)
		}

		this.freePlanLoading = false
		this.plusPlanLoading = false
		this.proPlanLoading = false
	}

	GetStripePaymentMethodResponse(message: StripeApiResponse) {
		if (message.success) {
			this.paymentMethodResolve(message.response)
			if (message.response == null) return

			// Get last 4 and expiration date to show at the top of the page
			this.paymentMethodLast4 = message.response.card.last4
			this.paymentMethodExpirationMonth = message.response.card.exp_month.toString()
			this.paymentMethodExpirationYear = message.response.card.exp_year.toString().substring(2)

			if (this.paymentMethodExpirationMonth.length == 1) {
				this.paymentMethodExpirationMonth = "0" + this.paymentMethodExpirationMonth
			}
		} else {
			this.successMessage = ""
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code)
		}
	}

	SetStripeSubscriptionCancelledResponse(message: StripeApiResponse) {
		this.continueOrCancelSubscriptionLoading = false

		if (message.success) {
			this.errorMessage = ""
			this.successMessage = (this.dataService.dav.user.SubscriptionStatus == 0 ? this.locale.cancelSubscriptionSuccessMessage : this.locale.continueSubscriptionSuccessMessage).replace('{0}', this.periodEndDate)
			this.dataService.dav.user.SubscriptionStatus = this.dataService.dav.user.SubscriptionStatus == 0 ? 1 : 0
		} else {
			this.successMessage = ""
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code)
		}
	}
}