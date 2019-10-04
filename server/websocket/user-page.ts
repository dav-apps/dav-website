import { UpdateUser, SendDeleteAccountEmail, SendRemoveAppEmail } from 'dav-npm';
import * as websocket from '../websocket';

export const updateUserKey = "updateUser";
export const sendDeleteAccountEmailKey = "sendDeleteAccountEmail";
export const sendRemoveAppEmailKey = "sendRemoveAppEmail";

export async function updateUser(message: {
	jwt: string,
	email?: string,
	username?: string,
	password?: string,
	avatar?: string,
	paymentToken?: string
	plan?: number
}){
	let updateUserResponse = await UpdateUser(message.jwt, {
		email: message.email, 
		username: message.username, 
		password: message.password, 
		avatar: message.avatar, 
		paymentToken: message.paymentToken, 
		plan: message.plan});

	websocket.emit(updateUserKey, updateUserResponse);
}

export async function sendDeleteAccountEmail(message: {
	jwt: string
}){
	let sendDeleteAccountEmailResponse = await SendDeleteAccountEmail(message.jwt);
	websocket.emit(sendDeleteAccountEmailKey, sendDeleteAccountEmailResponse);
}

export async function sendRemoveAppEmail(message: {jwt: string, appId: number}){
	let sendRemoveAppEmailResponse = await SendRemoveAppEmail(message.jwt, message.appId);
	websocket.emit(sendRemoveAppEmailKey, sendRemoveAppEmailResponse);
}