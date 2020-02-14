import { CreateApp, GetApp, GetActiveAppUsers, GetAllApps, UpdateApp } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	createApp,
	getApp,
	getActiveAppUsers,
	getAllApps,
	updateApp
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

export async function getApp(message: {jwt: string, id: number}){
	let result = await GetApp(message.jwt, message.id);
	websocket.emit(getApp.name, result);
}

export async function getActiveAppUsers(message: {jwt: string, id: number, start?: number, end?: number}){
	let result = await GetActiveAppUsers(message.jwt, message.id, message.start, message.end);
	websocket.emit(getActiveAppUsers.name, result);
}

export async function getAllApps(){
	let getAllAppsResponse = await GetAllApps(websocket.auth);
	websocket.emit(getAllApps.name, getAllAppsResponse);
}

export async function updateApp(message: {
	jwt: string,
	id: number,
	name?: string,
	description?: string,
	published?: boolean,
	linkWeb?: string,
	linkPlay?: string,
	linkWindows?: string
}){
	let result = await UpdateApp(message.jwt, message.id, {
		name: message.name,
		description: message.description,
		published: message.published,
		linkWeb: message.linkWeb,
		linkPlay: message.linkPlay,
		linkWindows: message.linkWindows
	});
	websocket.emit(updateApp.name, result);
}