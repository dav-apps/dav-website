import { GetApi } from 'dav-npm';
import * as websocket from '../websocket';

export const getApiKey = "getApi";

export async function getApi(message: {jwt: string, id: number}){
	let result = await GetApi(message.jwt, message.id);
	websocket.emit(getApiKey, result);
}