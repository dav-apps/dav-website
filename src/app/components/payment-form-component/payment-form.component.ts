import { Component, Output, EventEmitter } from '@angular/core';
import { ApiResponse, ApiErrorResponse, CreateStripeCustomerForUserResponseData } from 'dav-npm';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
declare var Stripe: any;
declare var io: any;

const createStripeCustomerForUserKey = "createStripeCustomerForUser";
const saveStripePaymentMethodKey = "savePaymentMethod";

@Component({
	selector: 'dav-website-payment-form',
	templateUrl: './payment-form.component.html',
	styleUrls: [
		'./payment-form.component.scss'
	]
})
export class PaymentFormComponent{
	locale = enUS.paymentFormComponent;
	socket: any;
	@Output() completed = new EventEmitter();
	stripe: any;
	elements: any;
	card: any;
	errorMessage: string = "";
	cardInputComplete: boolean = false;

	constructor(
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().paymentFormComponent;
	}

	ngOnInit(){
		this.socket = io();
		this.socket.on(createStripeCustomerForUserKey, (message: ApiResponse<CreateStripeCustomerForUserResponseData> | ApiErrorResponse) => this.CreateStripeCustomerForUserResponse(message));
		this.socket.on(saveStripePaymentMethodKey, (message: StripeApiResponse) => this.SaveStripePaymentMethodResponse(message));
	}

	ngAfterViewInit(){
		this.stripe = Stripe(environment.stripePublishableKey);
		this.elements = this.stripe.elements();

		this.card = this.elements.create('card');
		this.card.mount("#card-element");

		this.card.addEventListener('change', (event: any) => this.onChange(event));
	}

	onChange(event: any){
		this.cardInputComplete = event.complete;

		if(event.error){
			this.errorMessage = event.error.message;
		}else{
			this.errorMessage = "";
		}
	}

	async SaveCard(){
		if(!this.cardInputComplete) return;

		// Create a stripe customer if the user has no stripe customer
		if(!this.dataService.user.StripeCustomerId){
			this.socket.emit(createStripeCustomerForUserKey, {
				jwt: this.dataService.user.JWT
			});
		}else{
			await this.CreatePaymentMethod();
		}
	}

	async CreatePaymentMethod(){
		let result = await this.stripe.createPaymentMethod('card', this.card)

		if(result.error){
			// Show error
			this.errorMessage = result.error.message;
		}else{
			// Send the payment method to the server
			this.socket.emit(saveStripePaymentMethodKey, {
				paymentMethodId: result.paymentMethod.id,
				customerId: this.dataService.user.StripeCustomerId
			});
		}
	}

	CreateStripeCustomerForUserResponse(message: ApiResponse<CreateStripeCustomerForUserResponseData> | ApiErrorResponse){
		if(message.status == 201){
			this.dataService.user.StripeCustomerId = (message as ApiResponse<CreateStripeCustomerForUserResponseData>).data.stripe_customer_id;
			this.CreatePaymentMethod();
		}else{
			// Show error message
			this.errorMessage = this.locale.unexpectedError.replace('{0}', (message as ApiErrorResponse).errors[0].code.toString());
		}
	}

	SaveStripePaymentMethodResponse(message: StripeApiResponse){
		if(message.success){
			this.completed.emit();
		}else{
			// Show error
			this.errorMessage = this.locale.unexpectedError.replace('{0}', message.response.code);
		}
	}
}