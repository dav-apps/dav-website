import { GetAllApps } from 'dav-npm';
import * as websocket from '../websocket';

export const getAllAppsKey = "getAllApps";

export async function getAllApps(){
	let getAllAppsResponse = await GetAllApps(websocket.auth);
	websocket.emit(getAllAppsKey, getAllAppsResponse);
}