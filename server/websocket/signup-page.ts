import { Signup, GetDevByApiKey, Auth, ApiResponse, DevResponseData, Login } from 'dav-npm';
import * as websocket from '../websocket';

export const signupKey = "signup";
export const signupImplicitKey = "signupImplicit";

export async function signup(message: {username: string, email: string, password: string}){
	let signupResponse = await Signup(websocket.auth, message.email, message.password, message.username);
	websocket.emit(signupKey, signupResponse);
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
		websocket.emit(signupImplicitKey, getDevResponse);
		return;
	}

	// Create the auth of the dev
	let getDevResponseData = (getDevResponse as ApiResponse<DevResponseData>).data;
	let devAuth = new Auth(getDevResponseData.apiKey, getDevResponseData.secretKey, getDevResponseData.uuid);

	// Signup the user with the first dev
	let signupResponse = await Signup(websocket.auth, message.email, message.password, message.username);

	if(signupResponse.status != 201){
		websocket.emit(signupImplicitKey, signupResponse);
		return;
	}

	// Log in the user with the dev auth
	let loginResponse = await Login(devAuth, message.email, message.password);
	websocket.emit(signupImplicitKey, loginResponse);
}