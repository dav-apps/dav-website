import 'bootstrap'

let navbar: HTMLElement
let navbarContainer: HTMLDivElement

let navbarBackgroundVisible = false

window.addEventListener("scroll", onScroll)
window.addEventListener("resize", setSize)
window.addEventListener("load", main)

function main() {
	navbar = document.getElementById("navbar") as HTMLElement
	navbarContainer = document.getElementById('navbar-container') as HTMLDivElement

	setTimeout(() => {
		setSize()
		onScroll()
	}, 30)
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