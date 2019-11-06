import { GetApp, UpdateApp } from 'dav-npm';
import * as websocket from '../websocket';

export const getAppKey = "getApp";
export const updateAppKey = "updateApp";

export async function getApp(message: {jwt: string, id: number}){
	let result = await GetApp(message.jwt, message.id);
	websocket.emit(getAppKey, result);
}

export async function updateApp(message: {
	jwt: string,
	id: number,
	name?: string,
	description?: string,
	linkWeb?: string,
	linkPlay?: string,
	linkWindows?: string
}){
	let result = await UpdateApp(message.jwt, message.id, {
		name: message.name,
		description: message.description,
		linkWeb: message.linkWeb,
		linkPlay: message.linkPlay,
		linkWindows: message.linkWindows
	});
	websocket.emit(updateAppKey, result);
}