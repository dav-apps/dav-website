import { GetPurchase } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	getPurchase
}

export async function getPurchase(message: {id: number}){
	let response = await GetPurchase(websocket.auth, message.id);
	websocket.emit(getPurchase.name, response);
}