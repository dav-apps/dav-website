import { GetAppUsers } from 'dav-npm';
import * as websocket from '../websocket';

export const getAppUsersKey = "getAppUsers";

export async function getAppUsers(message: {jwt: string, id: number}){
	let result = GetAppUsers(message.jwt, message.id);
	websocket.emit(getAppUsersKey, result);
}