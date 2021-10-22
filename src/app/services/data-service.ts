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

export async function GetUserAgentModel(): Promise<string> {
	if (navigator["userAgentData"]) {
		let userAgentData = navigator["userAgentData"]
		let uaValues = await userAgentData.getHighEntropyValues(["model"])
		let model = uaValues["model"]

		if (model && model.length > 0) return model
		return null
	}
}

export async function GetUserAgentPlatform(): Promise<string> {
	if (navigator["userAgentData"]) {
		let userAgentData = navigator["userAgentData"]
		let uaValues = await userAgentData.getHighEntropyValues(["platform", "platformVersion"])
		let platform = uaValues["platform"]
		let platformVersion = uaValues["platformVersion"]

		if (platform && platform.length > 0) {
			if (platformVersion && platformVersion.length > 0) {
				platform += ` ${platformVersion}`
			}

			return platform
		}

		return null
	}
}