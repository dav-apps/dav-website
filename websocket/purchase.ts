import { PurchasesController } from 'dav-js'
import * as websocket from '../websocket.js'

export const sockets = {
	getPurchase
}

export async function getPurchase(message: {
	uuid: string
}) {
	let response = await PurchasesController.GetPurchase({
		auth: websocket.auth,
		uuid: message.uuid
	})

	websocket.emit(getPurchase.name, response)
}