import { InitStatic, DavEnvironment, Auth } from 'dav-npm';
import * as authorization from './websocket/auth';
import * as session from './websocket/session';
import * as user from './websocket/user';
import * as purchase from './websocket/purchase';
import * as app from './websocket/app';
import * as stripe from './websocket/stripe';

var socket = null;
export var auth: Auth;

export function init(s: any){
	socket = s;
	for(let name in authorization.sockets) socket.on(name, authorization.sockets[name]);
	for(let name in session.sockets) socket.on(name, session.sockets[name]);
	for(let name in user.sockets) socket.on(name, user.sockets[name]);
	for(let name in purchase.sockets) socket.on(name, purchase.sockets[name]);
	for(let name in app.sockets) socket.on(name, app.sockets[name]);
	for(let name in stripe.sockets) socket.on(name, stripe.sockets[name]);

	InitStatic(process.env.ENV == "production" ? DavEnvironment.Production : DavEnvironment.Development);
	auth = new Auth(process.env.DAV_API_KEY, process.env.DAV_SECRET_KEY, process.env.DAV_UUID);
}

export function emit(key: string, message: any){
	if(!socket) return;
	socket.emit(key, message);
}