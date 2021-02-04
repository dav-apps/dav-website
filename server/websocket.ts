import { Dav, Auth, Environment } from 'dav-npm'
import * as user from './websocket/user'
import * as session from './websocket/session'
import * as stripe from './websocket/stripe'

var socket = null
export var auth: Auth

export function init(s: any) {
	socket = s
	for (let name in user.sockets) socket.on(name, user.sockets[name])
	for (let name in session.sockets) socket.on(name, session.sockets[name])
	for (let name in stripe.sockets) socket.on(name, stripe.sockets[name])

	new Dav({ environment: process.env.ENV == "production" ? Environment.Production : Environment.Development })
	auth = new Auth({
		apiKey: process.env.DAV_API_KEY,
		secretKey: process.env.DAV_SECRET_KEY,
		uuid: process.env.DAV_UUID
	})
}

export function emit(key: string, message: any) {
	if (!socket) return
	socket.emit(key, message)
}