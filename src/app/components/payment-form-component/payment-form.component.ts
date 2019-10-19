import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var Stripe: any;

@Component({
	selector: 'dav-website-payment-form',
	templateUrl: './payment-form.component.html'
})
export class PaymentFormComponent{
	stripe: any = null;
	elements: any = null;

	constructor(){
		this.stripe = Stripe(environment.stripePublishableKey);
		this.elements = this.stripe.elements;
	}
}