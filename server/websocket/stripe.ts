import Stripe from 'stripe';
import * as websocket from '../websocket';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {apiVersion: '2019-12-03'});

export const sockets = {
	saveStripePaymentMethod,
	getStripePaymentMethod,
	setStripeSubscription,
	setStripeSubscriptionCancelled,
	retrieveStripeAccount,
	createStripeAccountLink,
	retrieveStripeBalance
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

		websocket.emit(saveStripePaymentMethod.name, {
			success: true,
			response: result
		});
	}catch(error){
		websocket.emit(saveStripePaymentMethod.name, {
			success: false,
			response: error.raw
		});
	}
}

export async function getStripePaymentMethod(message: {customerId: string}){
	try{
		let result = await stripe.paymentMethods.list({
			customer: message.customerId,
			type: 'card'
		});

		let paymentMethod: any = null;
		if(result.data.length > 0){
			paymentMethod = result.data[0];
		}

		websocket.emit(getStripePaymentMethod.name, {
			success: true,
			response: paymentMethod
		});
	}catch(error){
		websocket.emit(getStripePaymentMethod.name, {
			success: false,
			response: error.raw
		});
	}
}

export async function setStripeSubscription(message: {customerId: string, planId: string}){
	try{
		let result: any;

		// Get the current subscription of the customer
		let subscriptions = await stripe.subscriptions.list({customer: message.customerId});

		if(message.planId){
			if(subscriptions.data.length == 0){
				// Create a new subscription
				result = await stripe.subscriptions.create({
					customer: message.customerId,
					items: [{plan: message.planId}]
				});
			}else{
				let subscriptionItem = subscriptions.data[0].items.data[0];

				// Update the subscription
				result = await stripe.subscriptions.update(subscriptions.data[0].id, {
					items: [{
						id: subscriptionItem.id,
						plan: message.planId
					}],
					cancel_at_period_end: false
				});
			}
		}else{
			// Cancel the subscription
			result = await stripe.subscriptions.update(subscriptions.data[0].id, {
				cancel_at_period_end: true
			});
		}

		websocket.emit(setStripeSubscription.name, {
			success: true,
			response: result
		});
	}catch(error){
		websocket.emit(setStripeSubscription.name, {
			success: false,
			response: error.raw
		});
	}
}

export async function setStripeSubscriptionCancelled(message: {customerId: string, cancel: boolean}){
	try{
		// Get the current subscription of the customer
		let subscriptions = await stripe.subscriptions.list({customer: message.customerId});
		let subscriptionId = "";

		if(subscriptions.data.length > 0){
			subscriptionId = subscriptions.data[0].id;
		}

		let result = await stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: message.cancel
		});

		websocket.emit(setStripeSubscriptionCancelled.name, {
			success: true,
			response: result
		});
	}catch(error){
		websocket.emit(setStripeSubscriptionCancelled.name, {
			success: false,
			response: error.raw
		});
	}
}

export async function retrieveStripeAccount(message: {id: string}){
	try{
		let account = await stripe.accounts.retrieve(message.id);
		websocket.emit(retrieveStripeAccount.name, {
			success: true,
			response: account
		});
	}catch(error){
		websocket.emit(retrieveStripeAccount.name, {
			success: false,
			response: error.raw
		});
	}
}

export async function createStripeAccountLink(message: {account: string, successUrl: string, failureUrl: string, type: string}){
	try{
		let accountLink = await stripe.accountLinks.create({
			account: message.account,
			success_url: message.successUrl,
			failure_url: message.failureUrl,
			type: message.type
		});

		websocket.emit(createStripeAccountLink.name, {
			success: true,
			response: accountLink
		});
	}catch(error){
		websocket.emit(createStripeAccountLink.name, {
			success: false,
			response: error.raw
		});
	}
}

export async function retrieveStripeBalance(message: {account: string}){
	try{
		let balance = await stripe.balance.retrieve({stripeAccount: message.account});

		websocket.emit(retrieveStripeBalance.name, {
			success: true,
			response: balance
		});
	}catch(error){
		websocket.emit(retrieveStripeBalance.name, {
			success: false,
			response: error.raw
		});
	}
}