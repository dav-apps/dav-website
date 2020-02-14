import { Login, Signup, GetDevByApiKey, ApiResponse, DevResponseData, Auth } from 'dav-npm';
import * as websocket from '../websocket';

export const sockets = {
	login,
	loginImplicit,
	signup,
	signupImplicit,
	signupSession
}

export async function login(message: {email: string, password: string}){
	let loginResponse = await Login(websocket.auth, message.email, message.password);
	websocket.emit(login.name, loginResponse);
}

export async function loginImplicit(message: {
	apiKey: string,
	email: string,
	password: string
}){
	// Get the dev
	let getDevResponse = await GetDevByApiKey(websocket.auth, message.apiKey);

	if(getDevResponse.status != 200){
		websocket.emit(loginImplicit.name, getDevResponse);
		return;
	}

	// Create the auth of the dev
	let getDevResponseData = (getDevResponse as ApiResponse<DevResponseData>).data;
	let devAuth = new Auth(getDevResponseData.apiKey, getDevResponseData.secretKey, getDevResponseData.uuid);

	// Log the user in
	let loginResponse = await Login(devAuth, message.email, message.password);
	websocket.emit(loginImplicit.name, loginResponse);
}

export async function signup(message: {username: string, email: string, password: string}){
	let signupResponse = await Signup(websocket.auth, message.email, message.password, message.username);
	websocket.emit(signup.name, signupResponse);
}

export async function signupImplicit(message: {
	apiKey: string,
	username: string,
	email: string,
	password: string
}){
	// Get the dev
	let getDevResponse = await GetDevByApiKey(websocket.auth, message.apiKey);

	if(getDevResponse.status != 200){
		websocket.emit(signupImplicit.name, getDevResponse);
		return;
	}

	// Create the auth of the dev
	let getDevResponseData = (getDevResponse as ApiResponse<DevResponseData>).data;
	let devAuth = new Auth(getDevResponseData.apiKey, getDevResponseData.secretKey, getDevResponseData.uuid);

	// Signup the user with the first dev
	let signupResponse = await Signup(websocket.auth, message.email, message.password, message.username);

	if(signupResponse.status != 201){
		websocket.emit(signupImplicit.name, signupResponse);
		return;
	}

	// Log in the user with the dev auth
	let loginResponse = await Login(devAuth, message.email, message.password);
	websocket.emit(signupImplicit.name, loginResponse);
}

export async function signupSession(message: {
	username: string,
	email: string,
	password: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}){
	let response = await Signup(websocket.auth, message.email, message.password, message.username, message.appId, message.apiKey, message.deviceName, message.deviceType, message.deviceOs);
	websocket.emit(signupSession.name, response);
}