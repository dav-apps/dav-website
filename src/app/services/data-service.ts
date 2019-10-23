import { Injectable } from "@angular/core";
import { DavUser } from 'dav-npm';
import * as locales from 'src/locales/locales';

@Injectable()
export class DataService{
	user: DavUser;
	locale: string = navigator.language;
	hideNavbarAndFooter: boolean = false;
	userPromise: Promise<DavUser> = new Promise(resolve => this.userPromiseResolve = resolve);
	userPromiseResolve: Function;
	userDownloadPromise: Promise<any> = new Promise(resolve => this.userDownloadPromiseResolve = resolve);
	userDownloadPromiseResolve: Function;
	startPageErrorMessage: string = "";
	startPageSuccessMessage: string = "";

	constructor(){
		this.user = new DavUser(() => this.userPromiseResolve(this.user));
	}

	GetLocale(){
		let l = this.locale.toLowerCase();

		if(l.includes("en")){			// en
			if(l == "en-gb")				return locales.enGB;
			else								return locales.enUS;
		}else if(l.includes("de")){	// de
			if(l == "de-at")				return locales.deAT;
			else if(l == "de-ch")		return locales.deCH;
			else								return locales.deDE;
		}

		return locales.enUS;
	}
}

export interface StripeApiResponse{
	success: boolean;
	response: any;
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