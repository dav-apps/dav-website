import * as Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import * as websocket from '../websocket';

export const setStripeSubscriptionKey = "setStripeSubscription";

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
					plan: message.planId
				});
			}else{
				let subscriptionItem = subscriptions.data[0].items.data[0];

				// Update the subscription
				result = await stripe.subscriptions.update(subscriptions.data[0].id, {
					items: [{
						id: subscriptionItem.id,
						plan: message.planId
					}]
				});
			}
		}else{
			// Cancel the subscription
			result = await stripe.subscriptions.update(subscriptions.data[0].id, {
				cancel_at_period_end: true
			});
		}

		websocket.emit(setStripeSubscriptionKey, {
			success: true,
			response: result
		});
	}catch(error){
		websocket.emit(setStripeSubscriptionKey, {
			success: false,
			response: error.raw
		});
	}
}