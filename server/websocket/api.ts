import { CreateApi, GetApi } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createApi
}

export async function createApi(message: {jwt: string, appId: number, name: string}){
	let result = await CreateApi(message.jwt, message.appId, message.name);
	websocket.emit(createApi.name, result);
}