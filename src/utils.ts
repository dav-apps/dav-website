import { Dav, Environment, PromiseHolder } from 'dav-js'
import { devEnvironment, prodEnvironment } from './environments'

class DataService {
	userLoadedPromiseHolder: PromiseHolder<boolean> = new PromiseHolder()
	userDownloadedPromiseHolder: PromiseHolder<boolean> = new PromiseHolder()
	dav = Dav

	constructor() {
		// Get the correct env vars
		let env = getEnvironment()

		// Init dav-js
		new Dav({
			environment: env.production ? Environment.Production : Environment.Development,
			appId: env.appId,
			callbacks: {
				UserLoaded: () => this.userLoadedPromiseHolder.resolve(this.dav.isLoggedIn),
				UserDownloaded: () => this.userDownloadedPromiseHolder.resolve(this.dav.isLoggedIn)
			}
		})
	}
}

export function getDataService(): DataService {
	if (window["dataService"] == null) {
		window["dataService"] = new DataService()
	}

	return window["dataService"]
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