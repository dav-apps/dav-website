import {
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
	ResetNewEmail
} from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	getUserByAuth,
	updateUser,
	createStripeCustomerForUser,
	deleteUser,
	removeApp,
	confirmUser,
	sendVerificationEmail,
	sendDeleteAccountEmail,
	sendRemoveAppEmail,
	sendPasswordResetEmail,
	setPassword,
	saveNewPassword,
	saveNewEmail,
	resetNewEmail
}

export async function getUserByAuth(message: {id: number}){
	let response = await GetUserByAuth(websocket.auth, message.id);
	websocket.emit(getUserByAuth.name, response);
}

export async function updateUser(message: {
	jwt: string,
	email?: string,
	username?: string,
	password?: string,
	avatar?: string
}){
	let updateUserResponse = await UpdateUser(message.jwt, {
		email: message.email, 
		username: message.username, 
		password: message.password, 
		avatar: message.avatar
	});

	websocket.emit(updateUser.name, updateUserResponse);
}

export async function createStripeCustomerForUser(message: {jwt: string}){
	let response = await CreateStripeCustomerForUser(message.jwt);
	websocket.emit(createStripeCustomerForUser.name, response);
}

export async function deleteUser(message: {
	userId: number,
	emailConfirmationToken: string,
	passwordConfirmationToken: string
}){
	let response = await DeleteUser(websocket.auth, message.userId, message.emailConfirmationToken, message.passwordConfirmationToken);
	websocket.emit(deleteUser.name, response);
}

export async function removeApp(message: {
	appId: number,
	userId: number,
	passwordConfirmationToken: string
}){
	let response = await RemoveApp(websocket.auth, message.appId, message.userId, message.passwordConfirmationToken);
	websocket.emit(removeApp.name, response);
}

export async function confirmUser(message: {
	userId: number,
	emailConfirmationToken: string
}){
	let response = await ConfirmUser(websocket.auth, message.userId, message.emailConfirmationToken);
	websocket.emit(confirmUser.name, response);
}

export async function sendVerificationEmail(message: {jwt: string}){
	let response = await SendVerificationEmail(message.jwt);
	websocket.emit(sendVerificationEmail.name, response);
}

export async function sendDeleteAccountEmail(message: {jwt: string}){
	let response = await SendDeleteAccountEmail(message.jwt);
	websocket.emit(sendDeleteAccountEmail.name, response);
}

export async function sendRemoveAppEmail(message: {jwt: string, appId: number}){
	let response = await SendRemoveAppEmail(message.jwt, message.appId);
	websocket.emit(sendRemoveAppEmail.name, response);
}

export async function sendPasswordResetEmail(message: {email: string}){
	let response = await SendPasswordResetEmail(websocket.auth, message.email);
	websocket.emit(sendPasswordResetEmail.name, response);
}

export async function setPassword(message: {
	userId: number,
	passwordConfirmationToken: string,
	password: string
}){
	let response = await SetPassword(websocket.auth, message.userId, message.passwordConfirmationToken, message.password);
	websocket.emit(setPassword.name, response);
}

export async function saveNewPassword(message: {
	userId: number,
	passwordConfirmationToken: string
}){
	let response = await SaveNewPassword(websocket.auth, message.userId, message.passwordConfirmationToken);
	websocket.emit(saveNewPassword.name, response);
}

export async function saveNewEmail(message: {
	userId: number,
	emailConfirmationToken: string
}){
	let response = await SaveNewEmail(websocket.auth, message.userId, message.emailConfirmationToken);
	websocket.emit(saveNewEmail.name, response);
}

export async function resetNewEmail(message: {userId: number}){
	let response = await ResetNewEmail(websocket.auth, message.userId);
	websocket.emit(resetNewEmail.name, response);
}