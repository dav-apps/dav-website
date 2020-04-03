import { CreateSession } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createSession
}

export async function createSession(message: {
	email: string,
	password: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}){
	let response = await CreateSession(websocket.auth, message.email, message.password, message.appId, message.apiKey, message.deviceName, message.deviceType, message.deviceOs);
	websocket.emit(createSession.name, response);
}