import { CreateTable } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createTable
}

export async function createTable(message: {jwt: string, appId: number, name: string}){
	let result = await CreateTable(message.jwt, message.appId, message.name);
	websocket.emit(createTable.name, result);
}