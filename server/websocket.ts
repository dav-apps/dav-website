import { InitStatic, DavEnvironment, Auth } from 'dav-npm';
import * as loginPage from './websocket/login-page';
import * as signupPage from './websocket/signup-page';
import * as appsPage from './websocket/apps-page';
import * as userPage from './websocket/user-page';
import * as emailLinkPage from './websocket/email-link-page';
import * as pricingComponent from './websocket/pricing-component';
import * as paymentFormComponent from './websocket/payment-form-component';

var socket = null;
export var auth: Auth;

export function init(s: any){
	socket = s;
	socket.on(loginPage.loginKey, loginPage.login);
	socket.on(loginPage.loginImplicitKey, loginPage.loginImplicit);
	socket.on(loginPage.createSessionKey, loginPage.createSession);
	socket.on(loginPage.createSessionWithJwtKey, loginPage.createSessionWithJwt);
	socket.on(signupPage.signupKey, signupPage.signup);
	socket.on(signupPage.signupImplicitKey, signupPage.signupImplicit);
	socket.on(signupPage.signupSessionKey, signupPage.signupSession);
	socket.on(appsPage.getAllAppsKey, appsPage.getAllApps);
	socket.on(userPage.updateUserKey, userPage.updateUser);
	socket.on(userPage.sendVerificationEmailKey, userPage.sendVerificationEmail);
	socket.on(userPage.sendDeleteAccountEmailKey, userPage.sendDeleteAccountEmail);
	socket.on(userPage.sendRemoveAppEmailKey, userPage.sendRemoveAppEmail);
	socket.on(userPage.sendPasswordResetEmailKey, userPage.sendPasswordResetEmail);
	socket.on(userPage.setPasswordKey, userPage.setPassword);
	socket.on(emailLinkPage.deleteUserKey, emailLinkPage.deleteUser);
	socket.on(emailLinkPage.removeAppKey, emailLinkPage.removeApp);
	socket.on(emailLinkPage.confirmUserKey, emailLinkPage.confirmUser);
	socket.on(emailLinkPage.saveNewPasswordKey, emailLinkPage.saveNewPassword);
	socket.on(emailLinkPage.saveNewEmailKey, emailLinkPage.saveNewEmail);
	socket.on(emailLinkPage.resetNewEmailKey, emailLinkPage.resetNewEmail);
	socket.on(pricingComponent.setStripeSubscriptionKey, pricingComponent.setStripeSubscription);
	socket.on(paymentFormComponent.createStripeCustomerForUserKey, paymentFormComponent.createStripeCustomerForUser);
	socket.on(paymentFormComponent.saveStripePaymentMethodKey, paymentFormComponent.saveStripePaymentMethod);

	InitStatic(DavEnvironment.Development);
	auth = new Auth(process.env.DAV_API_KEY, process.env.DAV_SECRET_KEY, process.env.DAV_UUID);
}

export function emit(key: string, message: any){
	if(!socket) return;
	socket.emit(key, message);
}