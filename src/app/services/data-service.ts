import { Injectable } from '@angular/core'
import { Dav } from 'dav-js'
import * as locales from 'src/locales/locales'

@Injectable()
export class DataService {
	dav = Dav
	locale: string = navigator.language
	hideNavbarAndFooter: boolean = false
	userPromise = new Promise(resolve => this.userPromiseResolve = resolve)
	userPromiseResolve: Function
	userDownloadPromise = new Promise(resolve => this.userDownloadPromiseResolve = resolve)
	userDownloadPromiseResolve: Function
	startPageErrorMessage: string = ""
	startPageSuccessMessage: string = ""

	GetLocale() {
		let l = this.locale.toLowerCase()

		if (l.startsWith("en")) {			// en
			if (l == "en-gb") return locales.enGB
			else return locales.enUS
		} else if (l.startsWith("de")) {	// de
			if (l == "de-at") return locales.deAT
			else if (l == "de-ch") return locales.deCH
			else return locales.deDE
		}

		return locales.enUS
	}
}

export interface StripeApiResponse {
	success: boolean
	response: any
}

export function FindElement(currentElement: Element, tagName: string): Element {
	if (currentElement.tagName.toLowerCase() == tagName) return currentElement

	for (let i = 0; i < currentElement.children.length; i++) {
		let child = currentElement.children.item(i)

		let foundElement = FindElement(child, tagName)
		if (foundElement) return foundElement
	}

	return null
}

export function SetTextFieldAutocomplete(textFieldId: string, autocomplete: string) {
	// Find the input element
	let textField = document.getElementById(textFieldId)
	if (textField == null) return

	let input = FindElement(textField, "input") as HTMLInputElement

	if (input) {
		// Set the autocomplete attribute
		input.setAttribute("autocomplete", autocomplete)
	}
}

export function Capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}