import { GetUsers, GetActiveUsers } from 'dav-npm';
import * as websocket from '../websocket';

export const getUsersKey = "getUsers";
export const getActiveUsersKey = "getActiveUsers";

export async function getUsers(message: {jwt: string}){
	let result = await GetUsers(message.jwt);
	websocket.emit(getUsersKey, result);
}

export async function getActiveUsers(message: {
	jwt: string,
	start?: number,
	end?: number
}){
	let result = await GetActiveUsers(message.jwt, message.start, message.end);
	websocket.emit(getActiveUsersKey, result);
}