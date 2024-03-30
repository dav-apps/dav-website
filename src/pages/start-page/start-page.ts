import "dav-ui-components"
import "../../components/navbar-component/navbar-component"
import "../../components/footer-component/footer-component"
import { showElement, hideElement } from "../../utils"

let largeHeaderStoryline: HTMLHeadingElement
let smallHeaderStoryline: HTMLHeadingElement
let largeHeaderPocketlib: HTMLHeadingElement
let smallHeaderPocketlib: HTMLHeadingElement
let largeHeaderUniversalsoundboard: HTMLHeadingElement
let smallHeaderUniversalsoundboard: HTMLHeadingElement
let largeHeaderCalendo: HTMLHeadingElement
let smallHeaderCalendo: HTMLHeadingElement
let screenshotStorylineContainer: HTMLDivElement
let screenshotStoryline: HTMLImageElement
let screenshotStorylineMobileContainer: HTMLDivElement
let screenshotStorylineMobile: HTMLImageElement
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
	screenshotStorylineContainer = document.getElementById(
		"screenshot-storyline-container"
	) as HTMLDivElement
	screenshotStoryline = document.getElementById(
		"screenshot-storyline"
	) as HTMLImageElement
	screenshotStorylineMobileContainer = document.getElementById(
		"screenshot-storyline-mobile-container"
	) as HTMLDivElement
	screenshotStorylineMobile = document.getElementById(
		"screenshot-storyline-mobile"
	) as HTMLImageElement
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

	screenshotStoryline.style.width = `${window.innerWidth * 0.3}px`
	screenshotStorylineMobile.style.width = `${window.innerWidth * 0.3}px`
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
			largeHeaderStoryline,
			largeHeaderPocketlib,
			largeHeaderUniversalsoundboard,
			largeHeaderCalendo,
			// Show mobile screenshots
			screenshotStorylineMobileContainer,
			screenshotPocketlibMobileContainer,
			screenshotUniversalsoundboardMobileContainer,
			screenshotCalendoMobileContainer
		)

		hideElement(
			// Hide small headers
			smallHeaderStoryline,
			smallHeaderPocketlib,
			smallHeaderUniversalsoundboard,
			smallHeaderCalendo,
			// Hide desktop screenshots
			screenshotStorylineContainer,
			screenshotPocketlibContainer,
			screenshotUniversalsoundboardContainer,
			screenshotCalendoContainer
		)
	} else {
		hideElement(
			// Hide large headers
			largeHeaderStoryline,
			largeHeaderPocketlib,
			largeHeaderUniversalsoundboard,
			largeHeaderCalendo,
			// Hide mobile screenshots
			screenshotStorylineMobileContainer,
			screenshotPocketlibMobileContainer,
			screenshotUniversalsoundboardMobileContainer,
			screenshotCalendoMobileContainer
		)

		showElement(
			// Show small headers
			smallHeaderStoryline,
			smallHeaderPocketlib,
			smallHeaderUniversalsoundboard,
			smallHeaderCalendo,
			// Show desktop screenshots
			screenshotStorylineContainer,
			screenshotPocketlibContainer,
			screenshotUniversalsoundboardContainer,
			screenshotCalendoContainer
		)
	}
}
