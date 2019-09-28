import { Injectable } from "@angular/core";
import * as localforage from 'localforage';

const jwtKey = "jwt";

@Injectable()
export class DataService{
	hideNavbarAndFooter: boolean = false;

	async SetJwt(jwt: string){
		await localforage.setItem(jwtKey, jwt);
	}

	async GetJwt() : Promise<string>{
		return await localforage.getItem(jwtKey);
	}
}

export function FindElement(currentElement: Element, tagName: string) : Element{
	if(currentElement.tagName.toLowerCase() == tagName) return currentElement;

	for(let i = 0; i < currentElement.children.length; i++){
		let child = currentElement.children.item(i);
		
		let foundElement = FindElement(child, tagName);
		if(foundElement) return foundElement;
	}

	return null;
}

export function SetTextFieldAutocomplete(textFieldId: string, autocomplete: string, setFocus: boolean = false){
	// Find the input element
	let textField = document.getElementById(textFieldId);
	let input = FindElement(textField, "input") as HTMLInputElement;

	if(input){
		if(setFocus) input.focus();

		// Set the autocomplete attribute
		input.setAttribute("autocomplete", autocomplete);
	}
}