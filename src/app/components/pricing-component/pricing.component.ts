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
	@ViewChild('paymentForm', {static: true}) paymentForm: PaymentFormComponent;
	selectedPlan: number = -1;
	paymentFormDialogVisible: boolean = false;
	paymentFormLoading: boolean = false;
	errorMessage: string = "";
	errorMessageBarType: MessageBarType = MessageBarType.error;

	paymentFormDialogContent: IDialogContentProps = {
		title: this.locale.paymentFormDialogTitle
	}
	paymentFormSaveDialogButtonStyles: IButtonStyles = {
		root: {
			transition: buttonTransition,
			marginLeft: 10
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
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.setStripeSubscriptionSubscriptionKey);
	}

	PaymentDialogSaveClick(){
		this.paymentForm.SaveCard();
	}

	PlanButtonClick(plan: number){
		this.selectedPlan = plan;

		this.paymentFormDialogVisible = true;
		setTimeout(() => this.paymentForm.Init(), 1);
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
		}else{
			// Show error
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code);
		}
	}
}