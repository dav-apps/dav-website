import { PurchasesController } from 'dav-js'
import * as websocket from '../websocket'

export const sockets = {
	getPurchase
}

export async function getPurchase(message: {
	id: number
}) {
	let response = await PurchasesController.GetPurchase({
		auth: websocket.auth,
		id: message.id
	})

	websocket.emit(getPurchase.name, response)
}