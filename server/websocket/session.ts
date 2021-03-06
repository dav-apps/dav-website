import { SessionsController } from 'dav-js'
import * as websocket from '../websocket'

export const sockets = {
	createSession,
	createSessionFromAccessToken
}

export async function createSession(message: {
	email: string,
	password: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}) {
	let response = await SessionsController.CreateSession({
		auth: websocket.auth,
		email: message.email,
		password: message.password,
		appId: message.appId,
		apiKey: message.apiKey,
		deviceName: message.deviceName,
		deviceType: message.deviceType,
		deviceOs: message.deviceOs
	})

	websocket.emit(createSession.name, response)
}

export async function createSessionFromAccessToken(message: {
	accessToken: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}) {
	let response = await SessionsController.CreateSessionFromAccessToken({
		auth: websocket.auth,
		accessToken: message.accessToken,
		appId: message.appId,
		apiKey: message.apiKey,
		deviceName: message.deviceName,
		deviceType: message.deviceType,
		deviceOs: message.deviceOs
	})

	websocket.emit(createSessionFromAccessToken.name, response)
}