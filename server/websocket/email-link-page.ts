import { DeleteUser, SaveNewPassword, SaveNewEmail, ResetNewEmail, RemoveApp } from 'dav-npm';
import * as websocket from '../websocket';

export const deleteUserKey = "deleteUser";
export const removeAppKey = "removeApp";
export const saveNewPasswordKey = "saveNewPassword";
export const saveNewEmailKey = "saveNewEmail";
export const resetNewEmailKey = "resetNewEmail";

export async function deleteUser(message: {
	userId: number,
	emailConfirmationToken: string,
	passwordConfirmationToken: string
}){
	let response = await DeleteUser(websocket.auth, message.userId, message.emailConfirmationToken, message.passwordConfirmationToken);
	websocket.emit(deleteUserKey, response);
}

export async function removeApp(message: {
	appId: number,
	userId: number,
	passwordConfirmationToken: string
}){
	let response = await RemoveApp(websocket.auth, message.appId, message.userId, message.passwordConfirmationToken);
	websocket.emit(removeAppKey, response);
}

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
	let response = await SaveNewEmail(websocket.auth, message.userId, message.emailConfirmationToken);
	websocket.emit(saveNewEmailKey, response);
}

export async function resetNewEmail(message: {userId: number}){
	let response = await ResetNewEmail(websocket.auth, message.userId);
	websocket.emit(resetNewEmailKey, response);
}