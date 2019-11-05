import { GetDev } from 'dav-npm';
import * as websocket from '../websocket';

export const getDevKey = "getDev";

export async function getDev(message: {jwt: string}){
	let response = await GetDev(message.jwt);
	websocket.emit(getDevKey, response);
}