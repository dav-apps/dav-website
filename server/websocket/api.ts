import { CreateApi, GetApi } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createApi,
	getApi
}

export async function createApi(message: {jwt: string, appId: number, name: string}){
	let result = await CreateApi(message.jwt, message.appId, message.name);
	websocket.emit(createApi.name, result);
}

export async function getApi(message: {jwt: string, id: number}){
	let result = await GetApi(message.jwt, message.id);
	websocket.emit(getApi.name, result);
}