import { getLocale } from '../../locales'
import {
	showElement,
	hideElement,
	getDataService
} from '../../utils'

let locale = getLocale().startPage
let dataService = getDataService()
let notLoggedInContainer: HTMLDivElement
let loggedInContainer: HTMLDivElement
let startHeader: HTMLDivElement
let largeHeaderPocketlib: HTMLHeadingElement
let smallHeaderPocketlib: HTMLHeadingElement
let largeHeaderUniversalsoundboard: HTMLHeadingElement
let smallHeaderUniversalsoundboard: HTMLHeadingElement
let largeHeaderCalendo: HTMLHeadingElement
let smallHeaderCalendo: HTMLHeadingElement
let screenshotPocketlibContainer: HTMLDivElement
let screenshotPocketlib: HTMLImageElement
let screenshotPocketlibMobileContainer: HTMLDivElement
let screenshotPocketlibMobile: HTMLImageElement
let screenshotUniversalsoundboardContainer: HTMLDivElement
let screenshotUniversalsoundboard: HTMLImageElement
let screenshotUniversalsoundboardMobileContainer: HTMLDivElement
let screenshotUniversalsoundboardMobile: HTMLImageElement
let screenshotCalendoContainer: HTMLDivElement
let screenshotCalendo: HTMLImageElement
let screenshotCalendoMobileContainer: HTMLDivElement
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
	screenshotPocketlibContainer = document.getElementById("screenshot-pocketlib-container") as HTMLDivElement
	screenshotPocketlib = document.getElementById("screenshot-pocketlib") as HTMLImageElement
	screenshotPocketlibMobileContainer = document.getElementById("screenshot-pocketlib-mobile-container") as HTMLDivElement
	screenshotPocketlibMobile = document.getElementById("screenshot-pocketlib-mobile") as HTMLImageElement
	screenshotUniversalsoundboardContainer = document.getElementById("screenshot-universalsoundboard-container") as HTMLDivElement
	screenshotUniversalsoundboard = document.getElementById("screenshot-universalsoundboard") as HTMLImageElement
	screenshotUniversalsoundboardMobileContainer = document.getElementById("screenshot-universalsoundboard-mobile-container") as HTMLDivElement
	screenshotUniversalsoundboardMobile = document.getElementById("screenshot-universalsoundboard-mobile") as HTMLImageElement
	screenshotCalendoContainer = document.getElementById("screenshot-calendo-container") as HTMLDivElement
	screenshotCalendo = document.getElementById("screenshot-calendo") as HTMLImageElement
	screenshotCalendoMobileContainer = document.getElementById("screenshot-calendo-mobile-container") as HTMLDivElement
	screenshotCalendoMobile = document.getElementById("screenshot-calendo-mobile") as HTMLImageElement

	loggedInHeader = document.getElementById("logged-in-header") as HTMLHeadingElement
	appsContainer = document.getElementById("apps-container") as HTMLDivElement
	welcomeMessage = document.getElementById("welcome-message") as HTMLDivElement
	welcomeMessageHeader = document.getElementById("welcome-message-header") as HTMLHeadingElement

	setSize()
	setStrings()
	dataService.initDav()
	await dataService.userLoadedPromiseHolder.AwaitResult()

	if (dataService.dav.isLoggedIn) {
		hideElement(notLoggedInContainer)
		showElement(loggedInContainer)
	} else {
		showElement(notLoggedInContainer)
		hideElement(loggedInContainer)
	}

	if (dataService.dav.user.Apps.length > 0) {
		loggedInHeader.classList.add("mb-3")
		hideElement(welcomeMessage)

		appsContainer.innerHTML = ""

		for (let app of dataService.dav.user.Apps) {
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
		welcomeMessageHeader.innerText = locale.welcomeTitle.replace('{0}', dataService.dav.user.FirstName)
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
			screenshotPocketlibMobileContainer,
			screenshotUniversalsoundboardMobileContainer,
			screenshotCalendoMobileContainer
		)

		hideElement(
			// Hide small headers
			smallHeaderPocketlib,
			smallHeaderUniversalsoundboard,
			smallHeaderCalendo,
			// Hide desktop screenshots
			screenshotPocketlibContainer,
			screenshotUniversalsoundboardContainer,
			screenshotCalendoContainer
		)
	} else {
		hideElement(
			// Hide large headers
			largeHeaderPocketlib,
			largeHeaderUniversalsoundboard,
			largeHeaderCalendo,
			// Hide mobile screenshots
			screenshotPocketlibMobileContainer,
			screenshotUniversalsoundboardMobileContainer,
			screenshotCalendoMobileContainer
		)

		showElement(
			// Show small headers
			smallHeaderPocketlib,
			smallHeaderUniversalsoundboard,
			smallHeaderCalendo,
			// Show desktop screenshots
			screenshotPocketlibContainer,
			screenshotUniversalsoundboardContainer,
			screenshotCalendoContainer
		)
	}
}

function setStrings() {
	welcomeMessageHeader.innerText = locale.welcomeTitle.replace('{0}', '')
}