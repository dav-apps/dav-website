import { UsersController } from 'dav-js'
import * as websocket from '../websocket'

export const sockets = {
	signup,
	getUserById,
	sendConfirmationEmail,
	sendPasswordResetEmail,
	confirmUser,
	saveNewEmail,
	saveNewPassword,
	resetEmail,
	setPassword
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

export async function getUserById(message: {
	id: number
}) {
	let response = await UsersController.GetUserById({
		auth: websocket.auth,
		id: message.id
	})
	websocket.emit(getUserById.name, response)
}

export async function sendConfirmationEmail(message: {
	userId: number
}) {
	let response = await UsersController.SendConfirmationEmail({
		auth: websocket.auth,
		id: message.userId
	})
	websocket.emit(sendConfirmationEmail.name, response)
}

export async function sendPasswordResetEmail(message: {
	userId: number
}) {
	let response = await UsersController.SendPasswordResetEmail({
		auth: websocket.auth,
		id: message.userId
	})
	websocket.emit(sendPasswordResetEmail.name, response)
}

export async function confirmUser(message: {
	userId: number,
	emailConfirmationToken: string
}) {
	let response = await UsersController.ConfirmUser({
		auth: websocket.auth,
		id: message.userId,
		emailConfirmationToken: message.emailConfirmationToken
	})
	websocket.emit(confirmUser.name, response)
}

export async function saveNewEmail(message: {
	userId: number,
	emailConfirmationToken: string
}) {
	let response = await UsersController.SaveNewEmail({
		auth: websocket.auth,
		id: message.userId,
		emailConfirmationToken: message.emailConfirmationToken
	})
	websocket.emit(saveNewEmail.name, response)
}

export async function saveNewPassword(message: {
	userId: number,
	passwordConfirmationToken: string
}) {
	let response = await UsersController.SaveNewPassword({
		auth: websocket.auth,
		id: message.userId,
		passwordConfirmationToken: message.passwordConfirmationToken
	})
	websocket.emit(saveNewPassword.name, response)
}

export async function resetEmail(message: {
	userId: number,
	emailConfirmationToken: string
}) {
	let response = await UsersController.ResetEmail({
		auth: websocket.auth,
		id: message.userId,
		emailConfirmationToken: message.emailConfirmationToken
	})
	websocket.emit(resetEmail.name, response)
}

export async function setPassword(message: {
	userId: number,
	password: string,
	passwordConfirmationToken: string
}) {
	let response = await UsersController.SetPassword({
		auth: websocket.auth,
		id: message.userId,
		password: message.password,
		passwordConfirmationToken: message.passwordConfirmationToken
	})
	websocket.emit(setPassword.name, response)
}