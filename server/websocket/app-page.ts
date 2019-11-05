import { GetApp } from 'dav-npm';
import * as websocket from '../websocket';

export const getAppKey = "getApp";

export async function getApp(message: {jwt: string, id: number}){
	let result = await GetApp(message.jwt, message.id);
	websocket.emit(getAppKey, result);
}