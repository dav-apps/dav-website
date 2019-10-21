import { Component, ViewChild } from '@angular/core';
import { IDialogContentProps, IButtonStyles } from 'office-ui-fabric-react';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
import { PaymentFormComponent } from '../payment-form-component/payment-form.component';
declare var io: any;

const setStripeSubscriptionKey = "setStripeSubscription";
const buttonTransition = "all 0.15s";

@Component({
	selector: 'dav-website-pricing',
	templateUrl: './pricing.component.html'
})
export class PricingComponent{
	locale = enUS.pricingComponent;
	socket: any;
	@ViewChild('paymentForm', {static: true}) paymentForm: PaymentFormComponent;
	selectedPlan: number = -1;
	paymentFormDialogVisible: boolean = false;
	paymentFormLoading: boolean = false;

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
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().pricingComponent;
		this.paymentFormDialogContent.title = this.locale.paymentFormDialogTitle;
	}

	ngOnInit(){
		this.socket = io();
		this.socket.on(setStripeSubscriptionKey, (message: StripeApiResponse) => this.SetStripeSubscriptionResponse(message));
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

		this.socket.emit(setStripeSubscriptionKey, {
			customerId: this.dataService.user.StripeCustomerId,
			planId
		});
	}

	SetStripeSubscriptionResponse(message: StripeApiResponse){
		if(message.success){
			// Set the plan of the user
			this.dataService.user.Plan = this.selectedPlan;
		}else{
			// Todo: Show error
		}
	}
}