import { InitStatic, DavEnvironment, Auth } from 'dav-npm';
import * as loginPage from './websocket/login-page';

var socket = null;
export var auth: Auth;

export function init(s: any){
	socket = s;
	socket.on(loginPage.loginKey, loginPage.login);

	InitStatic(DavEnvironment.Development);
	auth = new Auth(process.env.DAV_API_KEY, process.env.DAV_SECRET_KEY, process.env.DAV_UUID);
}

export function emit(key: string, message: any){
	if(!socket) return;
	socket.emit(key, message);
}