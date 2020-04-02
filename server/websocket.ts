import { InitStatic, DavEnvironment, Auth } from 'dav-npm';
import * as authorization from './websocket/auth';
import * as analytics from './websocket/analytics';
import * as session from './websocket/session';
import * as user from './websocket/user';
import * as dev from './websocket/dev';
import * as provider from './websocket/provider';
import * as purchase from './websocket/purchase';
import * as app from './websocket/app';
import * as table from './websocket/table';
import * as event from './websocket/event';
import * as api from './websocket/api';
import * as stripe from './websocket/stripe';

var socket = null;
export var auth: Auth;

export function init(s: any){
	socket = s;
	for(let name in authorization.sockets) socket.on(name, authorization.sockets[name]);
	for(let name in analytics.sockets) socket.on(name, analytics.sockets[name]);
	for(let name in session.sockets) socket.on(name, session.sockets[name]);
	for(let name in user.sockets) socket.on(name, user.sockets[name]);
	for(let name in dev.sockets) socket.on(name, dev.sockets[name]);
	for(let name in provider.sockets) socket.on(name, provider.sockets[name]);
	for(let name in purchase.sockets) socket.on(name, purchase.sockets[name]);
	for(let name in app.sockets) socket.on(name, app.sockets[name]);
	for(let name in table.sockets) socket.on(name, table.sockets[name]);
	for(let name in event.sockets) socket.on(name, event.sockets[name]);
	for(let name in api.sockets) socket.on(name, api.sockets[name]);
	for(let name in stripe.sockets) socket.on(name, stripe.sockets[name]);

	InitStatic(process.env.ENV == "production" ? DavEnvironment.Production : DavEnvironment.Development);
	auth = new Auth(process.env.DAV_API_KEY, process.env.DAV_SECRET_KEY, process.env.DAV_UUID);
}

export function emit(key: string, message: any){
	if(!socket) return;
	socket.emit(key, message);
}