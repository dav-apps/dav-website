import { Dav, Environment, PromiseHolder } from 'dav-js'
import { devEnvironment, prodEnvironment } from './environments'
import * as locales from './locales'

var davInitialized: boolean = false
export var userLoadedPromiseHolder: PromiseHolder<boolean> = new PromiseHolder()

export function initDav() {
	if (davInitialized) return
	davInitialized = true

	// Get the env vars
	let env = getEnvironment()

	new Dav({
		environment: env.production ? Environment.Production : Environment.Development,
		appId: env.appId,
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

export function getEnvironment() {
	let metas = document.getElementsByName("env")
	if (metas.length == 0) return devEnvironment

	return (metas[0] as HTMLMetaElement).content == "production" ? prodEnvironment : devEnvironment
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