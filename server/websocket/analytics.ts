import { GetAppUsers, GetUsers, GetActiveUsers } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	getAppUsers,
	getUsers,
	getActiveUsers
}

export async function getAppUsers(message: {jwt: string, id: number}){
	let result = await GetAppUsers(message.jwt, message.id);
	websocket.emit(getAppUsers.name, result);
}

export async function getUsers(message: {jwt: string}){
	let result = await GetUsers(message.jwt);
	websocket.emit(getUsers.name, result);
}

export async function getActiveUsers(message: {
	jwt: string,
	start?: number,
	end?: number
}){
	let result = await GetActiveUsers(message.jwt, message.start, message.end);
	websocket.emit(getActiveUsers.name, result);
}