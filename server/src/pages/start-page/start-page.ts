import { Dav } from 'dav-js'
import {
	initDav,
	userLoadedPromiseHolder,
	getLocale,
	showElement,
	hideElement
} from '../../utils'

let locale = getLocale().startPage
let notLoggedInContainer = document.getElementById("not-logged-in-container") as HTMLDivElement
let loggedInContainer = document.getElementById("logged-in-container") as HTMLDivElement
let startHeader = document.getElementById("start-header") as HTMLDivElement
let startHeaderMessageText = document.getElementById("start-header-message-text") as HTMLParagraphElement
let largeHeaderPocketlib = document.getElementById("large-header-pocketlib") as HTMLHeadingElement
let smallHeaderPocketlib = document.getElementById("small-header-pocketlib") as HTMLHeadingElement
let largeHeaderUniversalsoundboard = document.getElementById("large-header-universalsoundboard") as HTMLHeadingElement
let smallHeaderUniversalsoundboard = document.getElementById("small-header-universalsoundboard") as HTMLHeadingElement
let largeHeaderCalendo = document.getElementById("large-header-calendo") as HTMLHeadingElement
let smallHeaderCalendo = document.getElementById("small-header-calendo") as HTMLHeadingElement
let pocketlibDescription = document.getElementById("pocketlib-description") as HTMLParagraphElement
let universalsoundboardDescription = document.getElementById("universalsoundboard-description") as HTMLParagraphElement
let calendoDescription = document.getElementById("calendo-description") as HTMLParagraphElement
let screenshotPocketlib = document.getElementById("screenshot-pocketlib") as HTMLImageElement
let screenshotPocketlibMobile = document.getElementById("screenshot-pocketlib-mobile") as HTMLImageElement
let screenshotUniversalsoundboard = document.getElementById("screenshot-universalsoundboard") as HTMLImageElement
let screenshotUniversalsoundboardMobile = document.getElementById("screenshot-universalsoundboard-mobile") as HTMLImageElement
let screenshotCalendo = document.getElementById("screenshot-calendo") as HTMLImageElement
let screenshotCalendoMobile = document.getElementById("screenshot-calendo-mobile") as HTMLImageElement

async function main() {
	initDav()
	await userLoadedPromiseHolder.AwaitResult()

	if (Dav.isLoggedIn) {
		notLoggedInContainer.style.display = "none"
		loggedInContainer.style.display = "block"
	} else {
		notLoggedInContainer.style.display = "block"
		loggedInContainer.style.display = "none"
	}
}

function setSize() {
	let mobileView: boolean = window.innerWidth <= 768

	startHeader.style.height = `${window.innerHeight * 0.7}px`
	screenshotPocketlib.style.width = `${window.innerWidth * 0.3}px`
	screenshotPocketlibMobile.style.width = `${window.innerWidth * 0.3}px`
	screenshotUniversalsoundboard.style.width = `${window.innerWidth * 0.5}px`
	screenshotUniversalsoundboardMobile.style.width = `${window.innerWidth * 0.8}px`
	screenshotCalendo.style.width = `${window.innerWidth * 0.3}px`
	screenshotCalendoMobile.style.width = `${window.innerWidth * 0.3}px`

	if (mobileView) {
		showElement(
			// Show large headers
			largeHeaderPocketlib,
			largeHeaderUniversalsoundboard,
			largeHeaderCalendo,
			// Show mobile screenshots
			screenshotPocketlibMobile,
			screenshotUniversalsoundboardMobile,
			screenshotCalendoMobile
		)

		hideElement(
			// Hide small headers
			smallHeaderPocketlib,
			smallHeaderUniversalsoundboard,
			smallHeaderCalendo,
			// Hide desktop screenshots
			screenshotPocketlib,
			screenshotUniversalsoundboard,
			screenshotCalendo
		)
	} else {
		hideElement(
			// Hide large headers
			largeHeaderPocketlib,
			largeHeaderUniversalsoundboard,
			largeHeaderCalendo,
			// Hide mobile screenshots
			screenshotPocketlibMobile,
			screenshotUniversalsoundboardMobile,
			screenshotCalendoMobile
		)

		showElement(
			// Show small headers
			smallHeaderPocketlib,
			smallHeaderUniversalsoundboard,
			smallHeaderCalendo,
			// Show desktop screenshots
			screenshotPocketlib,
			screenshotUniversalsoundboard,
			screenshotCalendo
		)
	}
}

function setStrings() {
	startHeaderMessageText.innerText = locale.title
	pocketlibDescription.innerHTML = locale.pocketlibDescription
	universalsoundboardDescription.innerHTML = locale.universalSoundboardDescription
	calendoDescription.innerHTML = locale.calendoDescription
}

window.addEventListener("resize", setSize)

setSize()
setStrings()
main()