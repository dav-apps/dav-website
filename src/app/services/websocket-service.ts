import { Injectable } from "@angular/core";
declare var io: any;

@Injectable()
export class WebsocketService{
	private socket: any;
	private subscriptions: WebsocketSubscription[] = [];
	private counter: number = 0;

	constructor(){
		this.socket = io();
		
		for(let key of Object.keys(Callbacks)){
			this.socket.on(key, (message: any) => {
				for(let subscription of this.subscriptions){
					if(subscription.type == +Callbacks[key]) subscription.callback(message);
				}
			});
		}
	}

	Subscribe(type: WebsocketCallbackType, callback: Function) : number{
		let key = this.counter++;

		this.subscriptions.push({
			key,
			type,
			callback
		});

		return key;
	}

	Unsubscribe(...keys: number[]){
		for(let key of keys){
			let i = this.subscriptions.findIndex(c => c.key == key);

			if(i !== -1){
				this.subscriptions.splice(i, 1);
			}
		}
	}

	Emit(type: WebsocketCallbackType, message: any){
		let key = getKeyByValue(Callbacks, type);

		if(key) this.socket.emit(key, message);
	}
}

interface WebsocketSubscription{
	key: number;
	type: WebsocketCallbackType;
	callback: Function;
}

export enum WebsocketCallbackType{
	// Auth
	Login = 1,
	LoginImplicit = 2,
	Signup = 3,
	SignupImplicit = 4,
	SignupSession = 5,
	// Analytics
	GetAppUsers = 6,
	GetUsers = 7,
	GetActiveUsers = 8,
	// Session
	CreateSession = 9,
	CreateSessionWithJwt = 10,
	// User
	UpdateUser = 11,
	CreateStripeCustomerForUser = 12,
	DeleteUser = 13,
	RemoveApp = 14,
	ConfirmUser = 15,
	SendVerificationEmail = 16,
	SendDeleteAccountEmail = 17,
	SendRemoveAppEmail = 18,
	SendPasswordResetEmail = 19,
	SetPassword = 20,
	SaveNewPassword = 21,
	SaveNewEmail = 22,
	ResetNewEmail = 23,
	// Dev
	GetDev = 24,
	// App
	CreateApp = 25,
	GetApp = 26,
	GetActiveAppUsers = 27,
	GetAllApps = 28,
	UpdateApp = 29,
	// Table
	CreateTable = 30,
	// Event
	GetEventByName = 31,
	// Api
	CreateApi = 32,
	GetApi = 33,
	// ApiError
	SetApiError = 34,
	// Stripe
	SaveStripePaymentMethod = 35,
	GetStripePaymentMethod = 36,
	SetStripeSubscription = 37,
	SetStripeSubscriptionCancelled = 38
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
	setStripeSubscriptionCancelled: WebsocketCallbackType.SetStripeSubscriptionCancelled
}

function getKeyByValue(object: any, value: any) {
	return Object.keys(object).find(key => object[key] === value);
}