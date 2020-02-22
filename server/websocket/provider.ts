import { CreateProvider, GetProvider } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createProvider,
	getProvider
}

export async function createProvider(message: {jwt: string, country: string}){
	let response = await CreateProvider(message.jwt, message.country);
	websocket.emit(createProvider.name, response);
}

export async function getProvider(message: {jwt: string}){
	let response = await GetProvider(message.jwt);
	websocket.emit(getProvider.name, response);
}