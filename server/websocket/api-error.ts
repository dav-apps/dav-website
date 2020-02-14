import { SetApiError } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	setApiError
}

export async function setApiError(message: {apiId: number, code: number, message: string}){
	let result = await SetApiError(websocket.auth, message.apiId, message.code, message.message);
	websocket.emit(setApiError.name, result);
}