import { InitStatic, DavEnvironment, Auth } from 'dav-npm';
import * as loginPage from './websocket/login-page';
import * as signupPage from './websocket/signup-page';
import * as appsPage from './websocket/apps-page';
import * as userPage from './websocket/user-page';

var socket = null;
export var auth: Auth;

export function init(s: any){
	socket = s;
	socket.on(loginPage.loginKey, loginPage.login);
	socket.on(signupPage.signupKey, signupPage.signup);
	socket.on(appsPage.getAllAppsKey, appsPage.getAllApps);
	socket.on(userPage.updateUserKey, userPage.updateUser);
	socket.on(userPage.sendVerificationEmailKey, userPage.sendVerificationEmail);
	socket.on(userPage.sendDeleteAccountEmailKey, userPage.sendDeleteAccountEmail);
	socket.on(userPage.sendRemoveAppEmailKey, userPage.sendRemoveAppEmail);
	socket.on(userPage.sendPasswordResetEmailKey, userPage.sendPasswordResetEmail);
	socket.on(userPage.setPasswordKey, userPage.setPassword);
	socket.on(userPage.saveNewPasswordKey, userPage.saveNewPassword);

	InitStatic(DavEnvironment.Development);
	auth = new Auth(process.env.DAV_API_KEY, process.env.DAV_SECRET_KEY, process.env.DAV_UUID);
}

export function emit(key: string, message: any){
	if(!socket) return;
	socket.emit(key, message);
}