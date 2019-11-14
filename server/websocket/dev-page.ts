import { GetDev, CreateApp } from 'dav-npm';
import * as websocket from '../websocket';

export const getDevKey = "getDev";
export const createAppKey = "createApp";

export async function getDev(message: {jwt: string}){
	let response = await GetDev(message.jwt);
	websocket.emit(getDevKey, response);
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
	websocket.emit(createAppKey, result);
}