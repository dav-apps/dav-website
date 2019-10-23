import { Component, ViewChild } from '@angular/core';
import { IDialogContentProps, IButtonStyles, MessageBarType } from 'office-ui-fabric-react';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
import { PaymentFormComponent } from '../payment-form-component/payment-form.component';

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
	@ViewChild('paymentForm', {static: true}) paymentForm: PaymentFormComponent;
	selectedPlan: number = -1;
	paymentFormDialogVisible: boolean = false;
	paymentFormLoading: boolean = false;
	errorMessage: string = "";
	successMessage: string = "";
	errorMessageBarType: MessageBarType = MessageBarType.error;
	successMessageBarType: MessageBarType = MessageBarType.success;
	paymentMethod: Promise<any> = new Promise((resolve) => this.paymentMethodResolve = resolve);
	paymentMethodResolve: Function;
	paymentMethodLast4: string;
	paymentMethodExpirationMonth: string;
	paymentMethodExpirationYear: string;

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

		if(this.dataService.userLoaded){
			if(this.dataService.user.IsLoggedIn && this.dataService.user.StripeCustomerId){
				this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, {customerId: this.dataService.user.StripeCustomerId});
			}else{
				this.paymentMethodResolve();
			}
		}else{
			this.dataService.userLoadCallbacks.push(() => {
				if(this.dataService.user.IsLoggedIn && this.dataService.user.StripeCustomerId){
					this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, {customerId: this.dataService.user.StripeCustomerId});
				}else{
					this.paymentMethodResolve();
				}
			});
		}
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
			this.paymentFormDialogVisible = true;
			setTimeout(() => this.paymentForm.Init(), 1);
		}else{
			// Update the subscription as the user has a payment method
			this.SetStripeSubscription();
		}
	}

	PaymentMethodInputCompleted(){
		this.paymentFormDialogVisible = false;
		this.SetStripeSubscription();
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

	SetStripeSubscriptionResponse(message: StripeApiResponse){
		if(message.success){
			// Set the plan of the user
			this.dataService.user.Plan = this.selectedPlan;
			this.errorMessage = "";
			this.successMessage = this.locale.changePlanSuccessMessage;
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
}