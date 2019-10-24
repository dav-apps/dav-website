import { Component, ViewChild } from '@angular/core';
import { IDialogContentProps, IButtonStyles, MessageBarType, SpinnerSize } from 'office-ui-fabric-react';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
import { PaymentFormComponent } from '../payment-form-component/payment-form.component';
import * as moment from 'moment';

const buttonTransition = "all 0.15s";

@Component({
	selector: 'dav-website-pricing',
	templateUrl: './pricing.component.html'
})
export class PricingComponent{
	locale = enUS.pricingComponent;
	socket: any;
	setStripeSubscriptionSubscriptionKey: number;
	getStripePaymentMethodSubscriptionKey: number;
	setStripeSubscriptionCancelledSubscriptionKey: number;
	@ViewChild('paymentForm', {static: true}) paymentForm: PaymentFormComponent;
	selectedPlan: number = -1;
	paymentFormDialogVisible: boolean = false;
	paymentFormLoading: boolean = false;
	errorMessage: string = "";
	successMessage: string = "";
	errorMessageBarType: MessageBarType = MessageBarType.error;
	successMessageBarType: MessageBarType = MessageBarType.success;
	spinnerSize: SpinnerSize = SpinnerSize.small;
	paymentMethod: Promise<any> = new Promise((resolve) => this.paymentMethodResolve = resolve);
	paymentMethodResolve: Function;
	paymentMethodLast4: string;
	paymentMethodExpirationMonth: string;
	paymentMethodExpirationYear: string;
	editPaymentMethod: boolean = false;
	periodEndDate: string;
	continueOrCancelSubscriptionLoading: boolean = false;

	paymentFormDialogContent: IDialogContentProps = {
		title: this.locale.paymentFormDialogTitle
	}
	paymentFormSaveDialogButtonStyles: IButtonStyles = {
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

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService
	){
		this.locale = this.dataService.GetLocale().pricingComponent;
		this.paymentFormDialogContent.title = this.locale.paymentFormDialogTitle;
	}

	ngOnInit(){
		this.setStripeSubscriptionSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.SetStripeSubscription, (message: StripeApiResponse) => this.SetStripeSubscriptionResponse(message));
		this.getStripePaymentMethodSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetStripePaymentMethod, (message: StripeApiResponse) => this.GetStripePaymentMethodResponse(message));
		this.setStripeSubscriptionCancelledSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.SetStripeSubscriptionCancelled, (message: StripeApiResponse) => this.SetStripeSubscriptionCancelledResponse(message));

		this.UpdateSubscriptionDetails();
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.setStripeSubscriptionSubscriptionKey,
			this.getStripePaymentMethodSubscriptionKey
		);
	}

	PaymentDialogSaveClick(){
		this.paymentForm.SaveCard();
	}

	async PlanButtonClick(plan: number){
		this.selectedPlan = plan;
		let paymentMethod = await this.paymentMethod;

		if(!paymentMethod){
			// Show the payment form
			this.editPaymentMethod = false;
			this.paymentFormDialogVisible = true;
			setTimeout(() => this.paymentForm.Init(), 1);
		}else{
			// Update the subscription as the user has a payment method
			this.SetStripeSubscription();
		}
	}

	EditPaymentMethodClick(){
		this.editPaymentMethod = true;
		this.paymentFormDialogVisible = true;
		setTimeout(() => this.paymentForm.Init(), 1);
	}

	ContinueOrCancelButtonClick(){
		this.continueOrCancelSubscriptionLoading = true;
		
		this.websocketService.Emit(WebsocketCallbackType.SetStripeSubscriptionCancelled, {
			customerId: this.dataService.user.StripeCustomerId,
			cancel: this.dataService.user.SubscriptionStatus == 0
		});
	}

	PaymentMethodInputCompleted(){
		this.paymentFormDialogVisible = false;

		if(!this.editPaymentMethod){
			this.SetStripeSubscription();
		}else{
			this.errorMessage = "";
			this.successMessage = this.locale.changePaymentMethodSuccessMessage;

			// Get the new payment method from the server
			this.UpdateSubscriptionDetails();
		}
	}

	SetStripeSubscription(){
		let planId = null;
		if(this.selectedPlan == 1) planId = environment.stripeDavPlusEurPlanId;
		else if(this.selectedPlan == 2) planId = environment.stripeDavProEurPlanId;

		this.websocketService.Emit(WebsocketCallbackType.SetStripeSubscription, {
			customerId: this.dataService.user.StripeCustomerId,
			planId
		});
	}

	async UpdateSubscriptionDetails(){
		await this.dataService.userPromise;

		// Get the payment method
		if(this.dataService.user.IsLoggedIn && this.dataService.user.StripeCustomerId){
			this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, {customerId: this.dataService.user.StripeCustomerId});
		}else{
			this.paymentMethodResolve();
		}

		// Show the date of the next payment or the subscription end
		moment.locale(this.dataService.locale);
		this.periodEndDate = moment(this.dataService.user.PeriodEnd).format('LL');
	}

	SetStripeSubscriptionResponse(message: StripeApiResponse){
		if(message.success){
			if(this.selectedPlan == 0){
				// Set the subscription status of the user
				this.errorMessage = "";
				this.successMessage = this.locale.cancelSubscriptionSuccessMessage.replace('{0}', this.periodEndDate);
				this.dataService.user.SubscriptionStatus = 1;
			}else{
				// Set the plan of the user
				this.errorMessage = "";
				this.successMessage = this.locale.changePlanSuccessMessage;
				this.dataService.user.Plan = this.selectedPlan;
			}
		}else{
			// Show error
			this.successMessage = "";
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code);
		}
	}

	GetStripePaymentMethodResponse(message: StripeApiResponse){
		if(message.success){
			this.paymentMethodResolve(message.response);

			// Get last 4 and expiration date to show at the top of the page
			this.paymentMethodLast4 = message.response.card.last4;
			this.paymentMethodExpirationMonth = message.response.card.exp_month.toString();
			this.paymentMethodExpirationYear = message.response.card.exp_year.toString().substring(2);

			if(this.paymentMethodExpirationMonth.length == 1){
				this.paymentMethodExpirationMonth = "0" + this.paymentMethodExpirationMonth;
			}
		}else{
			this.successMessage = "";
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code);
		}
	}

	SetStripeSubscriptionCancelledResponse(message: StripeApiResponse){
		this.continueOrCancelSubscriptionLoading = false;

		if(message.success){
			this.errorMessage = "";
			this.successMessage = (this.dataService.user.SubscriptionStatus == 0 ? this.locale.cancelSubscriptionSuccessMessage : this.locale.continueSubscriptionSuccessMessage).replace('{0}', this.periodEndDate);
			this.dataService.user.SubscriptionStatus = this.dataService.user.SubscriptionStatus == 0 ? 1 : 0;
		}else{
			this.successMessage = "";
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code);
		}
	}
}