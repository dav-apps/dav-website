import { Component, ViewChild } from '@angular/core'
import { IDialogContentProps, IButtonStyles, MessageBarType, SpinnerSize } from 'office-ui-fabric-react'
import { DataService, StripeApiResponse } from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'
import { PaymentFormDialogComponent } from '../payment-form-dialog-component/payment-form-dialog.component'
import * as moment from 'moment'

const buttonTransition = "all 0.15s"

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
	errorMessageBarType: MessageBarType = MessageBarType.error
	successMessageBarType: MessageBarType = MessageBarType.success
	spinnerSize: SpinnerSize = SpinnerSize.small
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
	upgradeDialogVisible: boolean = false

	dialogPrimaryButtonStyles: IButtonStyles = {
		root: {
			transition: buttonTransition,
			marginLeft: 10
		}
	}
	editPaymentMethodButtonStyles: IButtonStyles = {
		root: {
			float: 'right',
			marginBottom: 16
		}
	}
	upgradeDialogContent: IDialogContentProps = {
		title: this.locale.upgradePlusDialogTitle,
		subText: this.locale.upgradePlusDialogSubtext,
		styles: {
			subText: {
				fontSize: 14
			}
		}
	}

	constructor(
		public dataService: DataService,
		private websocketService: WebsocketService
	) {
		this.locale = this.dataService.GetLocale().pricingComponent
	}

	ngOnInit() {
		this.UpdateSubscriptionDetails()
	}

	async PlanButtonClick(plan: number) {
		this.selectedPlan = plan;
		let paymentMethod = await this.paymentMethod

		if (!paymentMethod) {
			// Show the payment form
			this.editPaymentMethod = false
			this.paymentFormDialog.ShowDialog()
		} else if (this.dataService.user.Plan == 0) {
			// Update the values of the upgrade dialog
			if (this.selectedPlan == 2) {
				this.upgradeDialogContent.title = this.locale.upgradeProDialogTitle
				this.upgradeDialogContent.subText = this.locale.upgradeProDialogSubtext
			} else {
				this.upgradeDialogContent.title = this.locale.upgradePlusDialogTitle
				this.upgradeDialogContent.subText = this.locale.upgradePlusDialogSubtext
			}

			// Show the upgrade dialog
			this.upgradeDialogVisible = true
		} else {
			// Update the subscription as the user has a payment method
			this.SetStripeSubscription()
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
				customerId: this.dataService.user.StripeCustomerId,
				cancel: this.dataService.user.SubscriptionStatus == 0
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
		this.upgradeDialogVisible = false
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
				customerId: this.dataService.user.StripeCustomerId,
				planId
			})
		)
	}

	async UpdateSubscriptionDetails() {
		await this.dataService.userPromise

		// Get the payment method
		if (this.dataService.user != null && this.dataService.user.StripeCustomerId != null) {
			this.GetStripePaymentMethodResponse(
				await this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, { customerId: this.dataService.user.StripeCustomerId })
			)
		} else {
			this.paymentMethodResolve()
		}

		if (this.dataService.user.Plan > 0 && this.dataService.user.PeriodEnd) {
			// Show the date of the next payment or the subscription end
			moment.locale(this.dataService.locale)
			this.periodEndDate = moment(this.dataService.user.PeriodEnd).format('LL')
		}
	}

	SetStripeSubscriptionResponse(message: StripeApiResponse) {
		if (message.success) {
			if (this.selectedPlan == 0) {
				// Set the subscription status of the user
				this.errorMessage = ""
				this.successMessage = this.locale.cancelSubscriptionSuccessMessage.replace('{0}', this.periodEndDate)
				this.dataService.user.SubscriptionStatus = 1
			} else {
				// Set the plan of the user
				this.errorMessage = ""
				this.successMessage = this.locale.changePlanSuccessMessage
				this.dataService.user.Plan = this.selectedPlan
			}
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
			this.successMessage = (this.dataService.user.SubscriptionStatus == 0 ? this.locale.cancelSubscriptionSuccessMessage : this.locale.continueSubscriptionSuccessMessage).replace('{0}', this.periodEndDate)
			this.dataService.user.SubscriptionStatus = this.dataService.user.SubscriptionStatus == 0 ? 1 : 0
		} else {
			this.successMessage = ""
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code)
		}
	}
}