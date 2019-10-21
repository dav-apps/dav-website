import * as Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { CreateStripeCustomerForUser } from 'dav-npm';
import * as websocket from '../websocket';

export const createStripeCustomerForUserKey = "createStripeCustomerForUser";
export const saveStripePaymentMethodKey = "savePaymentMethod";

export async function createStripeCustomerForUser(message: {jwt: string}){
	let response = await CreateStripeCustomerForUser(message.jwt);
	websocket.emit(createStripeCustomerForUserKey, response);
}

export async function saveStripePaymentMethod(message: {paymentMethodId: string, customerId: string}){
	try{
		// Attach the payment method to the customer
		let result = await stripe.paymentMethods.attach(message.paymentMethodId, {customer: message.customerId});

		// Set the payment method as default
		await stripe.customers.update(message.customerId, {
			invoice_settings: {
				default_payment_method: message.paymentMethodId
			}
		});

		// Remove all other payment methods
		let paymentMethods = await stripe.paymentMethods.list({
			customer: message.customerId,
			type: 'card'
		});

		for(let paymentMethod of paymentMethods.data){
			if(paymentMethod.id == message.paymentMethodId) continue;
			await stripe.paymentMethods.detach(paymentMethod.id);
		}

		websocket.emit(saveStripePaymentMethodKey, {
			success: true,
			response: result
		});
	}catch(error){
		websocket.emit(saveStripePaymentMethodKey, {
			success: false,
			response: error.raw
		});
	}
}