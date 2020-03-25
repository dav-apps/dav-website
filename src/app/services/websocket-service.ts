import { Injectable } from "@angular/core";
declare var io: any;

@Injectable()
export class WebsocketService{
	private socket: any;
	private subscriptions: WebsocketSubscription[] = [];

	constructor(){
		this.socket = io();

		for(let key of Object.keys(Callbacks)){
			this.socket.on(key, (message: any) => {
				let i = this.subscriptions.findIndex(s => s.type == Callbacks[key]);
				if(i != -1){
					this.subscriptions[i].resolve(message);
					this.subscriptions.splice(i, 1);
				}
			});
		}
	}

	async Emit(type: WebsocketCallbackType, message: any){
		let key = getKeyByValue(Callbacks, type);
		if(!key) return;

		let r: Function;
		let socketPromise: Promise<any> = new Promise((resolve: Function) => {
			r = resolve;
		});

		this.subscriptions.push({
			type,
			resolve: r
		});

		this.socket.emit(key, message);
		return await socketPromise;
	}
}

interface WebsocketSubscription{
	type: WebsocketCallbackType,
	resolve: Function
}

export enum WebsocketCallbackType{
	// Auth
	Login,
	LoginImplicit,
	Signup,
	SignupImplicit,
	SignupSession,
	// Analytics
	GetAppUsers,
	GetUsers,
	GetActiveUsers,
	// Session
	CreateSession,
	CreateSessionWithJwt,
	// User
	GetUserByAuth,
	UpdateUser,
	CreateStripeCustomerForUser,
	DeleteUser,
	RemoveApp,
	ConfirmUser,
	SendVerificationEmail,
	SendDeleteAccountEmail,
	SendRemoveAppEmail,
	SendPasswordResetEmail,
	SetPassword,
	SaveNewPassword,
	SaveNewEmail,
	ResetNewEmail,
	// Dev
	GetDev,
	// Provider
	CreateProvider,
	GetProvider,
	// Purchase
	GetPurchase,
	// App
	CreateApp,
	GetApp,
	GetActiveAppUsers,
	GetAllApps,
	UpdateApp,
	// Table
	CreateTable,
	// Event
	GetEventByName,
	// Api
	CreateApi,
	GetApi,
	// ApiError
	SetApiError,
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
	login: WebsocketCallbackType.Login,
	loginImplicit: WebsocketCallbackType.LoginImplicit,
	signup: WebsocketCallbackType.Signup,
	signupImplicit: WebsocketCallbackType.SignupImplicit,
	signupSession: WebsocketCallbackType.SignupSession,
	getAppUsers: WebsocketCallbackType.GetAppUsers,
	getUsers: WebsocketCallbackType.GetUsers,
	getActiveUsers: WebsocketCallbackType.GetActiveUsers,
	createSession: WebsocketCallbackType.CreateSession,
	createSessionWithJwt: WebsocketCallbackType.CreateSessionWithJwt,
	getUserByAuth: WebsocketCallbackType.GetUserByAuth,
	updateUser: WebsocketCallbackType.UpdateUser,
	createStripeCustomerForUser: WebsocketCallbackType.CreateStripeCustomerForUser,
	deleteUser: WebsocketCallbackType.DeleteUser,
	removeApp: WebsocketCallbackType.RemoveApp,
	confirmUser: WebsocketCallbackType.ConfirmUser,
	sendVerificationEmail: WebsocketCallbackType.SendVerificationEmail,
	sendDeleteAccountEmail: WebsocketCallbackType.SendDeleteAccountEmail,
	sendRemoveAppEmail: WebsocketCallbackType.SendRemoveAppEmail,
	sendPasswordResetEmail: WebsocketCallbackType.SendPasswordResetEmail,
	setPassword: WebsocketCallbackType.SetPassword,
	saveNewPassword: WebsocketCallbackType.SaveNewPassword,
	saveNewEmail: WebsocketCallbackType.SaveNewEmail,
	resetNewEmail: WebsocketCallbackType.ResetNewEmail,
	getDev: WebsocketCallbackType.GetDev,
	createProvider: WebsocketCallbackType.CreateProvider,
	getProvider: WebsocketCallbackType.GetProvider,
	getPurchase: WebsocketCallbackType.GetPurchase,
	createApp: WebsocketCallbackType.CreateApp,
	getApp: WebsocketCallbackType.GetApp,
	getActiveAppUsers: WebsocketCallbackType.GetActiveAppUsers,
	getAllApps: WebsocketCallbackType.GetAllApps,
	updateApp: WebsocketCallbackType.UpdateApp,
	createTable: WebsocketCallbackType.CreateTable,
	getEventByName: WebsocketCallbackType.GetEventByName,
	createApi: WebsocketCallbackType.CreateApi,
	getApi: WebsocketCallbackType.GetApi,
	setApiError: WebsocketCallbackType.SetApiError,
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
	return Object.keys(object).find(key => object[key] === value);
}