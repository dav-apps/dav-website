import { GetEventByName, EventSummaryPeriod } from 'dav-npm';
import * as websocket from '../websocket';

export const getEventByNameKey = "getEventByName";

export async function getEventByName(message: {
	jwt: string,
	name: string,
	appId: number,
	start?: number,
	end?: number,
	period?: EventSummaryPeriod
}){
	let result = await GetEventByName(
		message.jwt, 
		message.name, 
		message.appId, 
		message.start, 
		message.end, 
		message.period
	);
	websocket.emit(getEventByNameKey, result);
}