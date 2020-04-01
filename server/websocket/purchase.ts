import { GetPurchase, CompletePurchase } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	getPurchase,
	completePurchase
}

export async function getPurchase(message: {id: number}){
	let response = await GetPurchase(websocket.auth, message.id);
	websocket.emit(getPurchase.name, response);
}

export async function completePurchase(message: {id: number}){
	let response = await CompletePurchase(websocket.auth, message.id);
	websocket.emit(completePurchase.name, response);
}