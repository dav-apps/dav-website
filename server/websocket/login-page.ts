import { Login, Auth, GetDevByApiKey, ApiResponse, DevResponseData, CreateSession, CreateSessionWithJwt } from 'dav-npm';
import * as websocket from '../websocket';

export const loginKey = "login";
export const loginImplicitKey = "loginImplicit";
export const createSessionKey = "createSession";
export const createSessionWithJwtKey = "createSessionWithJwt";

export async function login(message: {email: string, password: string}){
	let loginResponse = await Login(websocket.auth, message.email, message.password);
	websocket.emit(loginKey, loginResponse);
}

export async function loginImplicit(message: {
	apiKey: string,
	email: string,
	password: string
}){
	// Get the dev
	let getDevResponse = await GetDevByApiKey(websocket.auth, message.apiKey);

	if(getDevResponse.status != 200){
		websocket.emit(loginImplicitKey, getDevResponse);
		return;
	}

	// Create the auth of the dev
	let getDevResponseData = (getDevResponse as ApiResponse<DevResponseData>).data;
	let devAuth = new Auth(getDevResponseData.apiKey, getDevResponseData.secretKey, getDevResponseData.uuid);

	// Log the user in
	let loginResponse = await Login(devAuth, message.email, message.password);
	websocket.emit(loginImplicitKey, loginResponse);
}

export async function createSession(message: {
	email: string,
	password: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}){
	let response = await CreateSession(websocket.auth, message.email, message.password, message.appId, message.apiKey, message.deviceName, message.deviceType, message.deviceOs);
	websocket.emit(createSessionKey, response);
}

export async function createSessionWithJwt(message: {
	jwt: string,
	appId: number,
	apiKey: string,
	deviceName: string,
	deviceType: string,
	deviceOs: string
}){
	let response = await CreateSessionWithJwt(message.jwt, message.appId, message.apiKey, message.deviceName, message.deviceType, message.deviceOs);
	websocket.emit(createSessionWithJwtKey, response);
}