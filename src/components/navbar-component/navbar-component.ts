import 'bootstrap'
import { Dav } from 'dav-js'
import { getLocale } from '../../locales'
import {
	initDav,
	userLoadedPromiseHolder,
	hideElement,
	showElement
} from '../../utils'

let locale = getLocale().navbarComponent
let navbar = document.getElementById("navbar") as HTMLElement
let notLoggedInList = document.getElementById("not-logged-in-list") as HTMLUListElement
let loggedInList = document.getElementById("logged-in-list") as HTMLUListElement
let pricingLink = document.getElementById("pricing-link") as HTMLAnchorElement
let loginLink = document.getElementById("login-link") as HTMLAnchorElement
let signupLink = document.getElementById("signup-link") as HTMLAnchorElement
let devDashboardLink = document.getElementById("dev-dashboard-link") as HTMLAnchorElement
let appsLink = document.getElementById("apps-link") as HTMLAnchorElement
let userLink = document.getElementById("user-link") as HTMLAnchorElement
let logoutLink = document.getElementById("logout-link") as HTMLAnchorElement

let navbarBackgroundVisible = false

async function main() {
	initDav()
	await userLoadedPromiseHolder.AwaitResult()
	
	if (Dav.isLoggedIn) {
		hideElement(notLoggedInList)
		showElement(loggedInList)

		userLink.innerText = Dav.user.FirstName

		if (Dav.user.Dev) {
			showElement(devDashboardLink)
		}
	} else {
		showElement(notLoggedInList)
		hideElement(loggedInList)
	}

	logoutLink.addEventListener("click", (event: MouseEvent) => {
		event.preventDefault()
		
		Dav.Logout().then(() => {
			window.location.href = "/"
		})
	})
}

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
	devDashboardLink.innerText = locale.devDashboard
	appsLink.innerText = locale.allApps
	logoutLink.innerText = locale.logout
}

window.addEventListener("scroll", () => {
	if (window.scrollY > 80 && !navbarBackgroundVisible) {
		navbar.classList.add("acrylic", "light", "shadow")
		navbarBackgroundVisible = true
	} else if (window.scrollY <= 80 && navbarBackgroundVisible) {
		navbarBackgroundVisible = false

		let animation = navbar.animate([
			{
				opacity: 1
			},
			{
				opacity: 0
			}
		], {
			duration: 300,
			pseudoElement: "::before"
		})

		navbar.classList.remove("shadow")
		animation.onfinish = () => navbar.classList.remove("acrylic", "light")
	}
})

window.addEventListener("resize", () => {
	updateNavbarContainerPadding()
})

updateNavbarContainerPadding()
setStrings()
main()