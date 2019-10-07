import { 
	UpdateUser, 
	SendVerificationEmail, 
	SendDeleteAccountEmail, 
	SendRemoveAppEmail, 
	SendPasswordResetEmail, 
	SetPassword,
	SaveNewPassword
} from 'dav-npm';
import * as websocket from '../websocket';

export const updateUserKey = "updateUser";
export const sendVerificationEmailKey = "sendVerificationEmail";
export const sendDeleteAccountEmailKey = "sendDeleteAccountEmail";
export const sendRemoveAppEmailKey = "sendRemoveAppEmail";
export const sendPasswordResetEmailKey = "sendPasswordResetEmail";
export const setPasswordKey = "setPassword";
export const saveNewPasswordKey = "saveNewPassword";

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

export async function sendVerificationEmail(message: {jwt: string}){
	let response = await SendVerificationEmail(message.jwt);
	websocket.emit(sendVerificationEmailKey, response);
}

export async function sendDeleteAccountEmail(message: {jwt: string}){
	let response = await SendDeleteAccountEmail(message.jwt);
	websocket.emit(sendDeleteAccountEmailKey, response);
}

export async function sendRemoveAppEmail(message: {jwt: string, appId: number}){
	let response = await SendRemoveAppEmail(message.jwt, message.appId);
	websocket.emit(sendRemoveAppEmailKey, response);
}

export async function sendPasswordResetEmail(message: {email: string}){
	let response = await SendPasswordResetEmail(websocket.auth, message.email);
	websocket.emit(sendPasswordResetEmailKey, response);
}

export async function setPassword(message: {
	userId: number,
	passwordConfirmationToken: string,
	password: string
}){
	let response = await SetPassword(websocket.auth, message.userId, message.passwordConfirmationToken, message.password);
	websocket.emit(setPasswordKey, response);
}

export async function saveNewPassword(message: {
	userId: number,
	passwordConfirmationToken: string
}){
	let response = await SaveNewPassword(websocket.auth, message.userId, message.passwordConfirmationToken);
	websocket.emit(saveNewPasswordKey, response);
}