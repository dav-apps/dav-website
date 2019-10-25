import { CreateEventLog } from 'dav-npm';

import * as websocket from '../websocket';

export const createEventLogKey = "createEventLog";

export async function createEventLog(message: {
	name: string, 
	appId: number, 
	saveCountry: boolean, 
	properties: any
}){
	let response = await CreateEventLog(websocket.auth.apiKey, message.name, message.appId, message.saveCountry, message.properties);
	websocket.emit(createEventLogKey, response);
}