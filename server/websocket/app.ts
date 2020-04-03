import { GetAllApps } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	getAllApps
}

export async function getAllApps(){
	let getAllAppsResponse = await GetAllApps(websocket.auth);
	websocket.emit(getAllApps.name, getAllAppsResponse);
}