import { Injectable } from "@angular/core"
declare var io: any

@Injectable()
export class WebsocketService {
	private socket: any;
	private subscriptions: WebsocketSubscription[] = []

	constructor() {
		this.socket = io()

		for (let key of Object.keys(Callbacks)) {
			this.socket.on(key, (message: any) => {
				let i = this.subscriptions.findIndex(s => s.type == Callbacks[key])
				if (i != -1) {
					this.subscriptions[i].resolve(message)
					this.subscriptions.splice(i, 1)
				}
			})
		}
	}

	async Emit(type: WebsocketCallbackType, message: any) {
		let key = getKeyByValue(Callbacks, type)
		if (!key) return

		let r: Function
		let socketPromise: Promise<any> = new Promise((resolve: Function) => {
			r = resolve
		})

		this.subscriptions.push({
			type,
			resolve: r
		})

		this.socket.emit(key, message)
		return await socketPromise
	}
}

interface WebsocketSubscription {
	type: WebsocketCallbackType,
	resolve: Function
}

export enum WebsocketCallbackType {
	// User
	Signup,
	GetUserById,
	SendConfirmationEmail,
	SendPasswordResetEmail,
	ConfirmUser,
	SaveNewEmail,
	SaveNewPassword,
	ResetEmail,
	SetPassword,
	// Session
	CreateSession,
	CreateSessionFromAccessToken,
	// Stripe
	SaveStripePaymentMethod,
	GetStripePaymentMethod,
	SetStripeSubscription,
	SetStripeSubscriptionCancelled,
	RetrieveStripeAccount,
	CreateStripeAccountLink,
	RetrieveStripeBalance,
	UpdateStripeCustomAccount
}

export const Callbacks = {
	// User
	signup: WebsocketCallbackType.Signup,
	getUserById: WebsocketCallbackType.GetUserById,
	sendConfirmationEmail: WebsocketCallbackType.SendConfirmationEmail,
	sendPasswordResetEmail: WebsocketCallbackType.SendPasswordResetEmail,
	confirmUser: WebsocketCallbackType.ConfirmUser,
	saveNewEmail: WebsocketCallbackType.SaveNewEmail,
	saveNewPassword: WebsocketCallbackType.SaveNewPassword,
	resetEmail: WebsocketCallbackType.ResetEmail,
	setPassword: WebsocketCallbackType.SetPassword,
	// Session
	createSession: WebsocketCallbackType.CreateSession,
	createSessionFromAccessToken: WebsocketCallbackType.CreateSessionFromAccessToken,
	// Stripe
	saveStripePaymentMethod: WebsocketCallbackType.SaveStripePaymentMethod,
	getStripePaymentMethod: WebsocketCallbackType.GetStripePaymentMethod,
	setStripeSubscription: WebsocketCallbackType.SetStripeSubscription,
	setStripeSubscriptionCancelled: WebsocketCallbackType.SetStripeSubscriptionCancelled,
	retrieveStripeAccount: WebsocketCallbackType.RetrieveStripeAccount,
	createStripeAccountLink: WebsocketCallbackType.CreateStripeAccountLink,
	retrieveStripeBalance: WebsocketCallbackType.RetrieveStripeBalance,
	updateStripeCustomAccount: WebsocketCallbackType.UpdateStripeCustomAccount
}

function getKeyByValue(object: any, value: any) {
	return Object.keys(object).find(key => object[key] === value)
}