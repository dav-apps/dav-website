import { SaveNewPassword, SaveNewEmail } from 'dav-npm';
import * as websocket from '../websocket';

export const saveNewPasswordKey = "saveNewPassword";
export const saveNewEmailKey = "saveNewEmail";

export async function saveNewPassword(message: {
	userId: number,
	passwordConfirmationToken: string
}){
	let response = await SaveNewPassword(websocket.auth, message.userId, message.passwordConfirmationToken);
	websocket.emit(saveNewPasswordKey, response);
}

export async function saveNewEmail(message: {
	userId: number,
	emailConfirmationToken: string
}){
	console.log(message)
	let response = await SaveNewEmail(websocket.auth, message.userId, message.emailConfirmationToken);
	websocket.emit(saveNewEmailKey, response);
}