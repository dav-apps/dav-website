import 'bootstrap'
import { getLocale } from '../../locales'
import {
	hideElement,
	showElement,
	getDataService
} from '../../utils'

let locale = getLocale().navbarComponent
let dataService = getDataService()
let navbar = document.getElementById("navbar") as HTMLElement
let navbarContainer = document.getElementById('navbar-container') as HTMLDivElement
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
	await dataService.userLoadedPromiseHolder.AwaitResult()

	if (
		dataService.dav.isLoggedIn
		&& dataService.dav.user.FirstName.length == 0
	) await dataService.userDownloadedPromiseHolder.AwaitResult()

	if (dataService.dav.isLoggedIn) {
		hideElement(notLoggedInList)
		showElement(loggedInList)

		userLink.innerText = dataService.dav.user.FirstName

		if (dataService.dav.user.Dev) {
			showElement(devDashboardLink)
		}
	} else {
		showElement(notLoggedInList)
		hideElement(loggedInList)
	}

	logoutLink.addEventListener("click", (event: MouseEvent) => {
		event.preventDefault()

		dataService.dav.Logout().then(() => {
			window.location.href = "/"
		})
	})
}

function setSize() {
	if (window.innerWidth < 576) {
		navbar.classList.remove("pb-0")
		navbarContainer.classList.remove("pt-0")
	} else {
		navbar.classList.add("pb-0")
		navbarContainer.classList.add("pt-0")
	}

	onScroll()
}

function setStrings() {
	pricingLink.innerText = locale.pricing
	loginLink.innerText = locale.login
	signupLink.innerText = locale.signup
	devDashboardLink.innerText = locale.devDashboard
	appsLink.innerText = locale.allApps
	logoutLink.innerText = locale.logout
}

function onScroll() {
	if (window.innerWidth < 576 || (window.scrollY > 80 && !navbarBackgroundVisible)) {
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
}

window.addEventListener("scroll", onScroll)
window.addEventListener("resize", setSize)

window.addEventListener("load", () => {
	setSize()
	setStrings()
	main()
})