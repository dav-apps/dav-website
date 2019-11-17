import { GetUsers } from 'dav-npm';
import * as websocket from '../websocket';

export const getUsersKey = "getUsers";

export async function getUsers(message: {jwt: string}){
	let result = await GetUsers(message.jwt);
	websocket.emit(getUsersKey, result);
}