import { GetApi, SetApiError } from 'dav-npm';
import * as websocket from '../websocket';

export const getApiKey = "getApi";
export const setApiErrorKey = "setApiError";

export async function getApi(message: {jwt: string, id: number}){
	let result = await GetApi(message.jwt, message.id);
	websocket.emit(getApiKey, result);
}

export async function setApiError(message: {apiId: number, code: number, message: string}){
	let result = await SetApiError(websocket.auth, message.apiId, message.code, message.message);
	websocket.emit(setApiErrorKey, result);
}