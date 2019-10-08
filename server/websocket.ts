import { InitStatic, DavEnvironment, Auth } from 'dav-npm';
import * as loginPage from './websocket/login-page';
import * as signupPage from './websocket/signup-page';
import * as appsPage from './websocket/apps-page';
import * as userPage from './websocket/user-page';
import * as emailLinkPage from './websocket/email-link-page';

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
	socket.on(emailLinkPage.saveNewPasswordKey, emailLinkPage.saveNewPassword);
	socket.on(emailLinkPage.saveNewEmailKey, emailLinkPage.saveNewEmail);
	socket.on(emailLinkPage.resetNewEmailKey, emailLinkPage.resetNewEmail);

	InitStatic(DavEnvironment.Development);
	auth = new Auth(process.env.DAV_API_KEY, process.env.DAV_SECRET_KEY, process.env.DAV_UUID);
}

export function emit(key: string, message: any){
	if(!socket) return;
	socket.emit(key, message);
}