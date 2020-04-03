import { CreateApp, GetAllApps } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createApp,
	getAllApps
}

export async function createApp(message: {
	jwt: string,
	name: string,
	description: string,
	linkWeb?: string,
	linkPlay?: string,
	linkWindows?: string
}){
	let result = await CreateApp(message.jwt, message.name, message.description, message.linkWeb, message.linkPlay, message.linkWindows);
	websocket.emit(createApp.name, result);
}

export async function getAllApps(){
	let getAllAppsResponse = await GetAllApps(websocket.auth);
	websocket.emit(getAllApps.name, getAllAppsResponse);
}