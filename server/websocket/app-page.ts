import { GetApp, UpdateApp, CreateTable, CreateApi } from 'dav-npm';
import * as websocket from '../websocket';

export const getAppKey = "getApp";
export const updateAppKey = "updateApp";
export const createTableKey = "createTable";
export const createApiKey = "createApi";

export async function getApp(message: {jwt: string, id: number}){
	let result = await GetApp(message.jwt, message.id);
	websocket.emit(getAppKey, result);
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
	websocket.emit(updateAppKey, result);
}

export async function createTable(message: {jwt: string, appId: number, name: string}){
	let result = await CreateTable(message.jwt, message.appId, message.name);
	websocket.emit(createTableKey, result);
}

export async function createApi(message: {jwt: string, appId: number, name: string}){
	let result = await CreateApi(message.jwt, message.appId, message.name);
	websocket.emit(createApiKey, result);
}