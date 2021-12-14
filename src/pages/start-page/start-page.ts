import { Dav } from 'dav-js'
import { getLocale } from '../../locales'
import {
	initDav,
	userLoadedPromiseHolder,
	showElement,
	hideElement
} from '../../utils'

let locale = getLocale().startPage
let notLoggedInContainer: HTMLDivElement
let loggedInContainer: HTMLDivElement
let startHeader: HTMLDivElement
let largeHeaderPocketlib: HTMLHeadingElement
let smallHeaderPocketlib: HTMLHeadingElement
let largeHeaderUniversalsoundboard: HTMLHeadingElement
let smallHeaderUniversalsoundboard: HTMLHeadingElement
let largeHeaderCalendo: HTMLHeadingElement
let smallHeaderCalendo: HTMLHeadingElement
let screenshotPocketlib: HTMLImageElement
let screenshotPocketlibMobile: HTMLImageElement
let screenshotUniversalsoundboard: HTMLImageElement
let screenshotUniversalsoundboardMobile: HTMLImageElement
let screenshotCalendo: HTMLImageElement
let screenshotCalendoMobile: HTMLImageElement

let loggedInHeader: HTMLHeadingElement
let appsContainer: HTMLDivElement
let welcomeMessage: HTMLDivElement
let welcomeMessageHeader: HTMLHeadingElement

window.addEventListener("resize", setSize)
window.addEventListener("load", main)

async function main() {
	notLoggedInContainer = document.getElementById("not-logged-in-container") as HTMLDivElement
	loggedInContainer = document.getElementById("logged-in-container") as HTMLDivElement
	startHeader = document.getElementById("start-header") as HTMLDivElement
	largeHeaderPocketlib = document.getElementById("large-header-pocketlib") as HTMLHeadingElement
	smallHeaderPocketlib = document.getElementById("small-header-pocketlib") as HTMLHeadingElement
	largeHeaderUniversalsoundboard = document.getElementById("large-header-universalsoundboard") as HTMLHeadingElement
	smallHeaderUniversalsoundboard = document.getElementById("small-header-universalsoundboard") as HTMLHeadingElement
	largeHeaderCalendo = document.getElementById("large-header-calendo") as HTMLHeadingElement
	smallHeaderCalendo = document.getElementById("small-header-calendo") as HTMLHeadingElement
	screenshotPocketlib = document.getElementById("screenshot-pocketlib") as HTMLImageElement
	screenshotPocketlibMobile = document.getElementById("screenshot-pocketlib-mobile") as HTMLImageElement
	screenshotUniversalsoundboard = document.getElementById("screenshot-universalsoundboard") as HTMLImageElement
	screenshotUniversalsoundboardMobile = document.getElementById("screenshot-universalsoundboard-mobile") as HTMLImageElement
	screenshotCalendo = document.getElementById("screenshot-calendo") as HTMLImageElement
	screenshotCalendoMobile = document.getElementById("screenshot-calendo-mobile") as HTMLImageElement

	loggedInHeader = document.getElementById("logged-in-header") as HTMLHeadingElement
	appsContainer = document.getElementById("apps-container") as HTMLDivElement
	welcomeMessage = document.getElementById("welcome-message") as HTMLDivElement
	welcomeMessageHeader = document.getElementById("welcome-message-header") as HTMLHeadingElement

	setSize()
	setStrings()
	initDav()
	await userLoadedPromiseHolder.AwaitResult()

	if (Dav.isLoggedIn) {
		hideElement(notLoggedInContainer)
		showElement(loggedInContainer)
	} else {
		showElement(notLoggedInContainer)
		hideElement(loggedInContainer)
	}

	if (Dav.user.Apps.length > 0) {
		loggedInHeader.classList.add("mb-3")
		hideElement(welcomeMessage)

		appsContainer.innerHTML = ""

		for (let app of Dav.user.Apps) {
			let weblinkHtml = ""
			let googlePlayLinkHtml = ""
			let microsoftStoreLinkHtml = ""

			if (app.WebLink) {
				weblinkHtml = `
					<div class="card-button-container">
						<a class="btn card-button text-dark mx-2"
							target="blank"
							href="${app.WebLink}">
							<i class="fas fa-globe"></i>
						</a>
					</div>
				`
			}

			if (app.GooglePlayLink) {
				googlePlayLinkHtml = `
					<div class="card-button-container">
						<a class="btn card-button text-dark mx-2"
							target="blank"
							href="${app.GooglePlayLink}">
							<i class="fab fa-android"></i>
						</a>
					</div>
				`
			}

			if (app.MicrosoftStoreLink) {
				microsoftStoreLinkHtml = `
					<div class="card-button-container">
						<a class="btn card-button text-dark mx-2"
							target="blank"
							href="${app.MicrosoftStoreLink}">
							<i class="fab fa-windows"></i>
						</a>
					</div>
				`
			}

			appsContainer.innerHTML += `
				<div class="card m-3" style="width: 18rem">
					<div class="card-body">
						<h5 class="card-title mb-3">${app.Name}</h5>
						<p class="card-text">${app.Description}</p>

						<div class="card-button-container">
							${weblinkHtml}
							${googlePlayLinkHtml}
							${microsoftStoreLinkHtml}
						</div>
					</div>
				</div>
			`
		}
	} else {
		loggedInHeader.classList.add("mb-4")
		welcomeMessageHeader.innerText = locale.welcomeTitle.replace('{0}', Dav.user.FirstName)
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
	welcomeMessageHeader.innerText = locale.welcomeTitle.replace('{0}', '')
}