import { CreateSession, CreateSessionFromJwt } from 'dav-npm'
import * as websocket from '../websocket'

export const sockets = {
	createSession,
	createSessionFromJwt
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
	let response = await CreateSession({
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

export async function createSessionFromJwt(message: {
	jwt: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}) {
	let response = await CreateSessionFromJwt({
		auth: websocket.auth,
		jwt: message.jwt,
		appId: message.appId,
		apiKey: message.apiKey,
		deviceName: message.deviceName,
		deviceType: message.deviceType,
		deviceOs: message.deviceOs
	})

	websocket.emit(createSessionFromJwt.name, response)
}