import { Login } from 'dav-npm';
import * as websocket from '../websocket';

export const loginKey = "login";

export async function login(message: {email: string, password: string}){
	let loginResponse = await Login(websocket.auth, message.email, message.password);
	
	websocket.emit(loginKey, loginResponse);
}