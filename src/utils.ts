import { Dav, Environment, PromiseHolder } from 'dav-js'
import { environment } from './environment'
import * as locales from './locales'

var davInitialized: boolean = false
export var userLoadedPromiseHolder: PromiseHolder<boolean> = new PromiseHolder()

export function initDav() {
	if (davInitialized) return
	davInitialized = true

	new Dav({
		environment: environment.production ? Environment.Production : Environment.Development,
		appId: environment.appId,
		callbacks: {
			UserLoaded: () => {
				userLoadedPromiseHolder.resolve(Dav.isLoggedIn)
			}
		}
	})
}

export function getLocale() {
	let lang = navigator.language.toLowerCase()

	if (lang.startsWith("en")) {
		if (lang == "en-gb") return locales.enGB
		else return locales.enUS
	} else if (lang.startsWith("de")) {
		if (lang == "de-at") return locales.deAT
		else if (lang == "de-ch") return locales.deCH
		else return locales.deDE
	}

	return locales.enUS
}

function getUpmostParentWithSingleChild(element: HTMLElement) {
	let currentElement = element
	let resultElement = element

	// Hide the parent if it only contains one element
	while (true) {
		currentElement = currentElement.parentElement

		if (currentElement.childElementCount > 1) {
			break
		}

		resultElement = currentElement
	}

	return resultElement
}

export function hideElement(...elements: HTMLElement[]) {
	for (let element of elements) {
		let parent = getUpmostParentWithSingleChild(element)
		parent.classList.add("d-none")
	}
}

export function showElement(...elements: HTMLElement[]) {
	for (let element of elements) {
		let parent = getUpmostParentWithSingleChild(element)
		parent.classList.remove("d-none")
	}
}