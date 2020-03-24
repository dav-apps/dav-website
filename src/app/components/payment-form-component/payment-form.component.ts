import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { ApiResponse, ApiErrorResponse, CreateStripeCustomerForUserResponseData } from 'dav-npm';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
declare var Stripe: any;

@Component({
	selector: 'dav-website-payment-form',
	templateUrl: './payment-form.component.html',
	styleUrls: [
		'./payment-form.component.scss'
	]
})
export class PaymentFormComponent{
	locale = enUS.paymentFormComponent;
	@Input() showSaveButton: boolean = true;
	@Output() completed = new EventEmitter();
	@Output() loadingStart = new EventEmitter();
	@Output() loadingEnd = new EventEmitter();
	stripe: any;
	elements: any;
	card: any;
	cardHandler = this.onChange.bind(this);
	errorMessage: string = "";
	cardInputComplete: boolean = false;
	loading: boolean = false;

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private cd: ChangeDetectorRef
	){
		this.locale = this.dataService.GetLocale().paymentFormComponent;
	}

	ngOnDestroy(){
		if(this.card){
			this.card.removeEventListener('change', this.cardHandler);
			this.card.destroy();
		}
	}

	Init(){
		this.stripe = Stripe(environment.stripePublishableKey);
		this.elements = this.stripe.elements();

		this.card = this.elements.create('card');
		this.card.mount("#card-element");

		this.card.addEventListener('change', this.cardHandler);
	}

	onChange(event: any){
		this.cardInputComplete = event.complete;

		if(event.error){
			this.errorMessage = event.error.message;
		}else{
			this.errorMessage = "";
		}

		this.cd.detectChanges();
	}

	async SaveCard(){
		if(!this.cardInputComplete) return;

		if(!this.loading){
			this.loadingStart.emit();
			this.loading = true;
		}

		// Create a stripe customer if the user has no stripe customer
		if(!this.dataService.user.StripeCustomerId){
			let CreateStripeCustomerForUserResponse: ApiResponse<CreateStripeCustomerForUserResponseData> | ApiErrorResponse = await this.websocketService.Emit(WebsocketCallbackType.CreateStripeCustomerForUser, {jwt: this.dataService.user.JWT});

			if(CreateStripeCustomerForUserResponse.status == 201){
				this.dataService.user.StripeCustomerId = (CreateStripeCustomerForUserResponse as ApiResponse<CreateStripeCustomerForUserResponseData>).data.stripe_customer_id;
				await this.CreatePaymentMethod();
			}else{
				// Show error message
				this.errorMessage = this.locale.unexpectedError.replace('{0}', (CreateStripeCustomerForUserResponse as ApiErrorResponse).errors[0].code.toString());
			}
		}else{
			await this.CreatePaymentMethod();
		}
	}

	async CreatePaymentMethod(){
		let result = await this.stripe.createPaymentMethod('card', this.card);

		if(result.error){
			// Show error
			this.errorMessage = result.error.message;
		}else{
			if(!this.loading){
				this.loadingStart.emit();
				this.loading = true;
			}
			
			// Send the payment method to the server
			let saveStripePaymentMethodResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.SaveStripePaymentMethod, {
				paymentMethodId: result.paymentMethod.id,
				customerId: this.dataService.user.StripeCustomerId
			})

			if(saveStripePaymentMethodResponse.success){
				this.completed.emit();
			}else{
				// Show error
				this.errorMessage = this.locale.unexpectedError.replace('{0}', saveStripePaymentMethodResponse.response.code);
			}

			if(this.loading){
				this.loadingEnd.emit();
				this.loading = false;
			}
		}
	}
}