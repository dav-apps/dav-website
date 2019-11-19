import { GetAppUsers, GetActiveAppUsers } from 'dav-npm';
import * as websocket from '../websocket';

export const getAppUsersKey = "getAppUsers";
export const getActiveAppUsersKey = "getActiveAppUsers";

export async function getAppUsers(message: {jwt: string, id: number}){
	let result = await GetAppUsers(message.jwt, message.id);
	websocket.emit(getAppUsersKey, result);
}

export async function getActiveAppUsers(message: {jwt: string, id: number, start?: number, end?: number}){
	let result = await GetActiveAppUsers(message.jwt, message.id, message.start, message.end);
	websocket.emit(getActiveAppUsersKey, result);
}