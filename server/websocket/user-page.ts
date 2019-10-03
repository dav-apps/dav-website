import { UpdateUser, SendDeleteAccountEmail } from 'dav-npm';
import * as websocket from '../websocket';

export const updateUserKey = "updateUser";
export const sendDeleteAccountEmailKey = "sendDeleteAccountEmail";

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