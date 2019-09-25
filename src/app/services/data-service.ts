import { Injectable } from "@angular/core";

@Injectable()
export class DataService{
	hideNavbarAndFooter: boolean = false;

	
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