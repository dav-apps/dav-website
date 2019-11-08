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
	Login = 1,
	LoginImplicit = 2,
	CreateSession = 3,
	CreateSessionWithJwt = 4,
	Signup = 5,
	SignupImplicit = 6,
	SignupSession = 7,
	GetAllApps = 8,
	UpdateUser = 9,
	SendVerificationEmail = 10,
	SendDeleteAccountEmail = 11,
	SendRemoveAppEmail = 12,
	SendPasswordResetEmail = 13,
	SetPassword = 14,
	DeleteUser = 15,
	RemoveApp = 16,
	ConfirmUser = 17,
	SaveNewPassword = 18,
	SaveNewEmail = 19,
	ResetNewEmail = 20,
	SetStripeSubscription = 21,
	GetStripePaymentMethod = 22,
	SetStripeSubscriptionCancelled = 23,
	CreateStripeCustomerForUser = 24,
	SaveStripePaymentMethod = 25,
	GetDev = 26,
	GetApp = 27,
	UpdateApp = 28,
	GetEventByName = 29
}

export const Callbacks = {
	login: WebsocketCallbackType.Login,
	loginImplicit: WebsocketCallbackType.LoginImplicit,
	createSession: WebsocketCallbackType.CreateSession,
	createSessionWithJwt: WebsocketCallbackType.CreateSessionWithJwt,
	signup: WebsocketCallbackType.Signup,
	signupImplicit: WebsocketCallbackType.SignupImplicit,
	signupSession: WebsocketCallbackType.SignupSession,
	getAllApps: WebsocketCallbackType.GetAllApps,
	updateUser: WebsocketCallbackType.UpdateUser,
	sendVerificationEmail: WebsocketCallbackType.SendVerificationEmail,
	sendDeleteAccountEmail: WebsocketCallbackType.SendDeleteAccountEmail,
	sendRemoveAppEmail: WebsocketCallbackType.SendRemoveAppEmail,
	sendPasswordResetEmail: WebsocketCallbackType.SendPasswordResetEmail,
	setPassword: WebsocketCallbackType.SetPassword,
	deleteUser: WebsocketCallbackType.DeleteUser,
	removeApp: WebsocketCallbackType.RemoveApp,
	confirmUser: WebsocketCallbackType.ConfirmUser,
	saveNewPassword: WebsocketCallbackType.SaveNewPassword,
	saveNewEmail: WebsocketCallbackType.SaveNewEmail,
	resetNewEmail: WebsocketCallbackType.ResetNewEmail,
	setStripeSubscription: WebsocketCallbackType.SetStripeSubscription,
	getStripePaymentMethod: WebsocketCallbackType.GetStripePaymentMethod,
	setStripeSubscriptionCancelled: WebsocketCallbackType.SetStripeSubscriptionCancelled,
	createStripeCustomerForUser: WebsocketCallbackType.CreateStripeCustomerForUser,
	saveStripePaymentMethod: WebsocketCallbackType.SaveStripePaymentMethod,
	getDev: WebsocketCallbackType.GetDev,
	getApp: WebsocketCallbackType.GetApp,
	updateApp: WebsocketCallbackType.UpdateApp,
	getEventByName: WebsocketCallbackType.GetEventByName
}

function getKeyByValue(object: any, value: any) {
	return Object.keys(object).find(key => object[key] === value);
}