import "dav-ui-components"
import "../../components/navbar-component/navbar-component"
import "../../components/footer-component/footer-component"
import { showElement, hideElement } from "../../utils"

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

window.addEventListener("resize", setSize)
window.addEventListener("load", main)

async function main() {
	largeHeaderPocketlib = document.getElementById(
		"large-header-pocketlib"
	) as HTMLHeadingElement
	smallHeaderPocketlib = document.getElementById(
		"small-header-pocketlib"
	) as HTMLHeadingElement
	largeHeaderUniversalsoundboard = document.getElementById(
		"large-header-universalsoundboard"
	) as HTMLHeadingElement
	smallHeaderUniversalsoundboard = document.getElementById(
		"small-header-universalsoundboard"
	) as HTMLHeadingElement
	largeHeaderCalendo = document.getElementById(
		"large-header-calendo"
	) as HTMLHeadingElement
	smallHeaderCalendo = document.getElementById(
		"small-header-calendo"
	) as HTMLHeadingElement
	screenshotPocketlibContainer = document.getElementById(
		"screenshot-pocketlib-container"
	) as HTMLDivElement
	screenshotPocketlib = document.getElementById(
		"screenshot-pocketlib"
	) as HTMLImageElement
	screenshotPocketlibMobileContainer = document.getElementById(
		"screenshot-pocketlib-mobile-container"
	) as HTMLDivElement
	screenshotPocketlibMobile = document.getElementById(
		"screenshot-pocketlib-mobile"
	) as HTMLImageElement
	screenshotUniversalsoundboardContainer = document.getElementById(
		"screenshot-universalsoundboard-container"
	) as HTMLDivElement
	screenshotUniversalsoundboard = document.getElementById(
		"screenshot-universalsoundboard"
	) as HTMLImageElement
	screenshotUniversalsoundboardMobileContainer = document.getElementById(
		"screenshot-universalsoundboard-mobile-container"
	) as HTMLDivElement
	screenshotUniversalsoundboardMobile = document.getElementById(
		"screenshot-universalsoundboard-mobile"
	) as HTMLImageElement
	screenshotCalendoContainer = document.getElementById(
		"screenshot-calendo-container"
	) as HTMLDivElement
	screenshotCalendo = document.getElementById(
		"screenshot-calendo"
	) as HTMLImageElement
	screenshotCalendoMobileContainer = document.getElementById(
		"screenshot-calendo-mobile-container"
	) as HTMLDivElement
	screenshotCalendoMobile = document.getElementById(
		"screenshot-calendo-mobile"
	) as HTMLImageElement

	setSize()
}

function setSize() {
	let mobileView: boolean = window.innerWidth <= 768

	screenshotPocketlib.style.width = `${window.innerWidth * 0.3}px`
	screenshotPocketlibMobile.style.width = `${window.innerWidth * 0.3}px`
	screenshotUniversalsoundboard.style.width = `${window.innerWidth * 0.5}px`
	screenshotUniversalsoundboardMobile.style.width = `${
		window.innerWidth * 0.8
	}px`
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
