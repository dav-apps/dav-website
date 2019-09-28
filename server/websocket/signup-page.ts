import { Signup } from 'dav-npm';
import * as websocket from '../websocket';

export const signupKey = "signup";

export async function signup(message: {username: string, email: string, password: string}){
	let signupResponse = await Signup(websocket.auth, message.email, message.password, message.username);
	websocket.emit(signupKey, signupResponse);
}