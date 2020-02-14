import { GetDev } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	getDev
}

export async function getDev(message: {jwt: string}){
	let response = await GetDev(message.jwt);
	websocket.emit(getDev.name, response);
}