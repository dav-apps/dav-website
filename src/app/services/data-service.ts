import { Injectable } from "@angular/core";
import { DavUser } from 'dav-npm';

@Injectable()
export class DataService{
	user: DavUser;
	hideNavbarAndFooter: boolean = false;
	userLoaded: boolean = false;
	userLoadCallbacks: Function[] = [];
	startPageSuccessMessage: string = "";

	constructor(){
		this.user = new DavUser(() => {
			this.userLoaded = true;
			for(let callback of this.userLoadCallbacks) callback();
			this.userLoadCallbacks = [];
		});
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