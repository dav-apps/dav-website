import { getLocale } from '../../utils'

let locale = getLocale().navbarComponent
let pricingLink = document.getElementById("pricing-link") as HTMLAnchorElement
let loginLink = document.getElementById("login-link") as HTMLAnchorElement
let signupLink = document.getElementById("signup-link") as HTMLAnchorElement

function updateNavbarContainerPadding() {
	let navbarContainer = document.getElementById('navbar-container') as HTMLDivElement

	if (window.innerWidth < 576) {
		navbarContainer.classList.remove("pt-0")
	} else {
		navbarContainer.classList.add("pt-0")
	}
}

function setStrings() {
	pricingLink.innerText = locale.pricing
	loginLink.innerText = locale.login
	signupLink.innerText = locale.signup
}

window.addEventListener("resize", () => {
	updateNavbarContainerPadding()
})

updateNavbarContainerPadding()
setStrings()