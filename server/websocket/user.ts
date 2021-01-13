import { UsersController } from 'dav-npm'
import * as websocket from '../websocket'

export const sockets = {
	signup,
	getUserByAuth,
	deleteUser,
	removeApp,
	confirmUser,
	sendPasswordResetEmail,
	setPassword,
	saveNewPassword,
	saveNewEmail,
	resetNewEmail
}

export async function signup(message: {
	email: string,
	firstName: string,
	password: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}) {
	let response = await UsersController.Signup({
		auth: websocket.auth,
		email: message.email,
		firstName: message.firstName,
		password: message.password,
		appId: message.appId,
		apiKey: message.apiKey,
		deviceName: message.deviceName,
		deviceType: message.deviceType,
		deviceOs: message.deviceOs
	})
	websocket.emit(signup.name, response)
}

export async function getUserByAuth(message: {id: number}){
	let response = await GetUserByAuth(websocket.auth, message.id);
	websocket.emit(getUserByAuth.name, response);
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